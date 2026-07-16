import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSubscription, tierMeets, type Tier } from "@/hooks/useSubscription";

// ---------------------------------------------------------------------------
// Feature flags with scheduled release dates.
//
// Each feature has two dates:
//   • earlyAt  — date at which paying tiers (default: "max") get access
//   • publicAt — date at which every user gets access
//
// The owner (accounts listed in OWNER_EMAILS, or any browser that has
// localStorage `fc_owner = "1"`) always has access — regardless of dates.
//
// To claim owner access on your device, open the browser devtools console
// and run:  localStorage.setItem("fc_owner", "1")
// ---------------------------------------------------------------------------

export type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  earlyAt: string; // ISO date — unlocked for `earlyTier` and above from this date
  publicAt: string; // ISO date — unlocked for everyone from this date
  earlyTier?: Tier; // default "max"
};

// Add any workspace-owner emails here; they always get access.
export const OWNER_EMAILS: string[] = [];

const EARLY_RELEASE = "2026-08-01T00:00:00Z";
const PUBLIC_RELEASE = "2026-08-30T00:00:00Z";

// The unreleased feature catalog. Ship new experimental features by adding
// entries here; they will roll out automatically on the dates below.
export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "ai_household_agent",
    name: "AI Household Agent",
    description:
      "Autonomous agent that proposes tasks, drafts messages, and books appointments on your behalf.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "voice_concierge",
    name: "Voice Concierge",
    description: "Talk to Family COO — hands-free morning briefing and natural voice commands.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "smart_receipts",
    name: "Smart Receipt Capture",
    description: "Snap any receipt — OCR + auto-categorize into expenses and reimbursements.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "family_memory_search",
    name: "Family Memory Search",
    description: "Ask 'when did we last…?' — semantic search across your family's timeline.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "sports_auto_import",
    name: "Sports Schedule Auto-Import",
    description: "Paste a team link — practices, games, and travel drop straight into the calendar.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "medical_timeline",
    name: "Medical Timeline",
    description: "Every visit, prescription, and vaccination for each family member in one view.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "travel_copilot",
    name: "Travel Copilot",
    description: "Packing lists, docs, and itineraries generated automatically from trips.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
  {
    key: "nanny_handoffs",
    name: "Nanny & Caregiver Handoffs",
    description: "One-tap shift summary with meals, moods, meds, and open tasks.",
    earlyAt: EARLY_RELEASE,
    publicAt: PUBLIC_RELEASE,
  },
];

function isOwnerLocal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("fc_owner") === "1";
  } catch {
    return false;
  }
}

export type FeatureStatus = {
  enabled: boolean;
  reason: "owner" | "public" | "early-tier" | "locked-tier" | "locked-date";
  availableAt?: string; // ISO — when the current user will get it (if locked)
};

export function evaluateFeature(
  flag: FeatureFlag,
  opts: { now: number; tier: Tier; email?: string | null; ownerLocal: boolean },
): FeatureStatus {
  const early = new Date(flag.earlyAt).getTime();
  const pub = new Date(flag.publicAt).getTime();
  const earlyTier = flag.earlyTier ?? "max";

  if (opts.ownerLocal || (opts.email && OWNER_EMAILS.includes(opts.email.toLowerCase()))) {
    return { enabled: true, reason: "owner" };
  }
  if (opts.now >= pub) return { enabled: true, reason: "public" };
  if (opts.now >= early && tierMeets(opts.tier, earlyTier)) {
    return { enabled: true, reason: "early-tier" };
  }
  // Locked — surface the earliest date the user could get it.
  if (opts.now < early) return { enabled: false, reason: "locked-date", availableAt: flag.earlyAt };
  return { enabled: false, reason: "locked-tier", availableAt: flag.publicAt };
}

export function useFeatureFlag(key: string): FeatureStatus {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const flag = FEATURE_FLAGS.find((f) => f.key === key);
  if (!flag || now == null) return { enabled: false, reason: "locked-date" };
  return evaluateFeature(flag, {
    now,
    tier,
    email: user?.email ?? null,
    ownerLocal: isOwnerLocal(),
  });
}

export function useAllFeatureFlags(): Array<{ flag: FeatureFlag; status: FeatureStatus }> {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (now == null) {
    return FEATURE_FLAGS.map((flag) => ({
      flag,
      status: { enabled: false, reason: "locked-date" as const },
    }));
  }
  const ownerLocal = isOwnerLocal();
  const email = user?.email ?? null;
  return FEATURE_FLAGS.map((flag) => ({
    flag,
    status: evaluateFeature(flag, { now, tier, email, ownerLocal }),
  }));
}
