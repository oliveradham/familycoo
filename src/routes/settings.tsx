import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { LANGUAGES, useLanguage } from "@/lib/i18n";
import { listFamilyMembers } from "@/lib/family.functions";
import { loadSampleFamily } from "@/lib/sample-data.functions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { deleteMyAccount } from "@/lib/account.functions";
import { createBillingPortalSession } from "@/lib/billing.functions";
import { useSubscription } from "@/hooks/useSubscription";
import { getPrefs, savePrefs } from "@/lib/prefs.functions";
import { isNative, isIOS, openExternal } from "@/lib/platform";

import {
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  isCurrentlySubscribed,
} from "@/lib/push";
import {
  Bell,
  Clock,
  Globe,
  Lock,
  LogOut,
  Mic,
  Moon,
  Palette,
  Shield,
  Sparkles,
  Users,
  Volume2,
  Wallet,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Family COO" }] }),
  component: SettingsPage,
});

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];


function Row({
  icon: Icon,
  label,
  hint,
  right,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="grid size-9 place-items-center rounded-full bg-zinc-900/5 text-zinc-900">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-zinc-900 justify-end" : "bg-zinc-300 justify-start"
      }`}
      aria-pressed={on}
      aria-label={label}
    >
      <span className="block size-5 rounded-full bg-white shadow ring-1 ring-black/5" />
    </button>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-foreground">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[13px] tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  );
}

function SettingsPage() {
  const { lang: language, setLang: setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteFn = useServerFn(deleteMyAccount);
  const openPortalFn = useServerFn(createBillingPortalSession);
  const listFamilyFn = useServerFn(listFamilyMembers);
  const loadSampleFn = useServerFn(loadSampleFamily);
  const { isActive, tier } = useSubscription();
  const [portalBusy, setPortalBusy] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const loadPrefs = useServerFn(getPrefs);
  const persistPrefs = useServerFn(savePrefs);
  const { data: familyMembers } = useQuery({
    queryKey: ["family", "members"],
    queryFn: () => listFamilyFn(),
  });
  const [tz, setTz] = useState("America/Los_Angeles");
  const [clock24, setClock24] = useState(false);
  const [weekStart, setWeekStart] = useState<"Sun" | "Mon">("Mon");
  const [morning, setMorning] = useState("06:30");
  const [afternoon, setAfternoon] = useState("14:30");
  const [evening, setEvening] = useState("20:30");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("06:00");

  const [pushBriefings, setPushBriefings] = useState(true);
  const [pushApprovals, setPushApprovals] = useState(true);
  const [pushConflicts, setPushConflicts] = useState(true);
  const [pushMarketing, setPushMarketing] = useState(false);

  const [voice, setVoice] = useState(true);
  const [autopilot, setAutopilot] = useState(true);
  const [proactive, setProactive] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [haptics, setHaptics] = useState(true);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const canPush = typeof window !== "undefined" && pushSupported();

  useEffect(() => {
    if (!canPush) return;
    isCurrentlySubscribed().then(setPushEnabled).catch(() => {});
  }, [canPush]);

  async function togglePush(next: boolean) {
    setPushBusy(true);
    setPushError(null);
    try {
      if (next) {
        const res = await subscribeToPush();
        if (!res.ok) {
          setPushError(res.error ?? "Could not enable push");
          setPushEnabled(false);
        } else {
          setPushEnabled(true);
        }
      } else {
        await unsubscribeFromPush();
        setPushEnabled(false);
      }
    } finally {
      setPushBusy(false);
    }
  }

  // Load persisted prefs
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadPrefs({}).then((p) => {
      if (cancelled || !p) return;
      if (p.timezone) setTz(p.timezone);
      if (p.morning_briefing_at) setMorning(p.morning_briefing_at.slice(0, 5));
      if (p.afternoon_check_in_at) setAfternoon(p.afternoon_check_in_at.slice(0, 5));
      if (p.evening_wrap_at) setEvening(p.evening_wrap_at.slice(0, 5));
      setAutopilot(!p.autopilot_paused);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, loadPrefs]);

  const save = (patch: Parameters<typeof persistPrefs>[0]["data"]) => {
    persistPrefs({ data: patch }).catch(() => {});
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        back
      />

      {/* Household profile */}
      <section className="px-6 mb-6">
        <SectionLabel>{t("settings.household")}</SectionLabel>
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full bg-zinc-900 text-white text-sm font-medium">
              {(user?.email?.[0] ?? "?").toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-serif italic text-lg leading-tight">Your household</p>
              <p className="text-[12px] text-muted-foreground">
                {familyMembers ? `${familyMembers.length} member${familyMembers.length === 1 ? "" : "s"}` : "Loading…"}
              </p>
            </div>
            <Link
              to="/family"
              className="text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4"
            >
              {t("settings.manage")}
            </Link>
          </div>
        </Card>
      </section>

      {/* Sample data */}
      <section className="px-6 mb-6">
        <SectionLabel>Sample data</SectionLabel>
        <Card>
          <p className="mb-3 text-[12px] text-muted-foreground">
            Load a demo family (Emma, Liam, Sofia) with events, tasks, and groceries so you can explore the app quickly. Idempotent — safe to tap once.
          </p>
          <button
            type="button"
            disabled={sampleBusy}
            onClick={async () => {
              if (sampleBusy) return;
              setSampleBusy(true);
              try {
                const res = await loadSampleFn();
                await queryClient.invalidateQueries();
                window.alert(res?.skipped ? "You already have data — sample not added." : "Sample family loaded.");
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "Could not load sample data");
              } finally {
                setSampleBusy(false);
              }
            }}
            className="w-full rounded-full border border-hairline bg-white px-4 py-2.5 text-[12px] font-medium uppercase tracking-widest text-foreground disabled:opacity-60"
          >
            {sampleBusy ? "Loading…" : "Load sample family"}
          </button>
        </Card>
      </section>

      {/* Time & Locale */}
      <section className="px-6 mb-6">
        <SectionLabel>{t("settings.timeLocale")}</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Globe}
              label={t("settings.language")}
              hint={t("settings.languageHint")}
              right={
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="max-w-[10rem] truncate rounded-lg border border-hairline bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              }
            />
            <Row
              icon={Globe}
              label={t("settings.timezone")}
              hint={t("settings.timezoneHint")}
              right={
                <select
                  value={tz}
                  onChange={(e) => { setTz(e.target.value); save({ timezone: e.target.value }); }}
                  className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  {TIMEZONES.map((z) => (
                    <option key={z} value={z}>
                      {z.replace("_", " ")}
                    </option>
                  ))}
                </select>
              }
            />
            <Row
              icon={Clock}
              label={t("settings.clock24")}
              hint={clock24 ? "e.g. 20:30" : "e.g. 8:30 PM"}
              right={<Toggle label="24-hour clock" on={clock24} onChange={setClock24} />}
            />
            <Row
              icon={Clock}
              label={t("settings.weekStart")}
              right={
                <div className="flex rounded-full bg-zinc-100 p-0.5 text-[11px]">
                  {(["Sun", "Mon"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setWeekStart(d)}
                      className={`rounded-full px-3 py-1 font-medium ${
                        weekStart === d ? "bg-white text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </Card>
      </section>

      {/* Briefing schedule */}
      <section className="px-6 mb-6">
        <SectionLabel>Briefing schedule</SectionLabel>
        <Card>
          <p className="mb-2 text-[12px] text-muted-foreground">
            When I deliver your three daily updates.
          </p>
          <div className="divide-y divide-hairline">
            <TimeField label="Morning briefing" value={morning} onChange={(v) => { setMorning(v); save({ morning_briefing_at: v }); }} />
            <TimeField label="Afternoon check-in" value={afternoon} onChange={(v) => { setAfternoon(v); save({ afternoon_check_in_at: v }); }} />
            <TimeField label="Evening wrap-up" value={evening} onChange={(v) => { setEvening(v); save({ evening_wrap_at: v }); }} />
          </div>
          <div className="mt-4 rounded-2xl bg-zinc-900/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quiet hours
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              I'll hold non-urgent nudges during this window.
            </p>
            <div className="mt-2 divide-y divide-hairline">
              <TimeField label="From" value={quietStart} onChange={setQuietStart} />
              <TimeField label="Until" value={quietEnd} onChange={setQuietEnd} />
            </div>
          </div>
        </Card>
      </section>

      {/* Notifications */}
      <section className="px-6 mb-6">
        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Bell}
              label="Push on this device"
              hint={
                !canPush
                  ? "Not supported in this browser"
                  : pushError
                    ? pushError
                    : pushEnabled
                      ? "Enabled — you'll receive briefings & alerts"
                      : "Enable to get briefings & agent alerts"
              }
              right={
                <Toggle
                  label="Push on this device"
                  on={pushEnabled}
                  onChange={(v) => {
                    if (!canPush || pushBusy) return;
                    void togglePush(v);
                  }}
                />
              }
            />

            <Row
              icon={Bell}
              label="Daily briefings"
              hint="Morning, afternoon, evening"
              right={<Toggle label="Daily briefings" on={pushBriefings} onChange={setPushBriefings} />}
            />
            <Row
              icon={Sparkles}
              label="Approvals ready"
              hint="When an agent has a draft for you"
              right={<Toggle label="Approvals ready" on={pushApprovals} onChange={setPushApprovals} />}
            />
            <Row
              icon={Bell}
              label="Conflict alerts"
              hint="Overlaps, at-risk items, weather"
              right={<Toggle label="Conflict alerts" on={pushConflicts} onChange={setPushConflicts} />}
            />
            <Row
              icon={Bell}
              label="Product updates"
              hint="New workflows, tips"
              right={<Toggle label="Product updates" on={pushMarketing} onChange={setPushMarketing} />}
            />
          </div>
        </Card>
      </section>

      {/* AI behavior */}
      <section className="px-6 mb-6">
        <SectionLabel>AI behavior</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Sparkles}
              label="Proactive suggestions"
              hint="Surface things before they become problems"
              right={<Toggle label="Proactive suggestions" on={proactive} onChange={setProactive} />}
            />
            <Row
              icon={Sparkles}
              label="Autopilot"
              hint="Run approved rules automatically"
              right={<Toggle label="Autopilot" on={autopilot} onChange={(v) => { setAutopilot(v); save({ autopilot_paused: !v }); }} />}
            />
            <Row
              icon={Mic}
              label="Voice capture"
              right={<Toggle label="Voice capture" on={voice} onChange={setVoice} />}
            />
            <Row
              icon={Volume2}
              label="Haptics & sound"
              right={<Toggle label="Haptics and sound" on={haptics} onChange={setHaptics} />}
            />
          </div>
        </Card>
      </section>

      {/* Appearance */}
      <section className="px-6 mb-6">
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Moon}
              label="Dark mode"
              hint="Follows briefing time by default"
              right={<Toggle label="Dark mode" on={darkMode} onChange={setDarkMode} />}
            />
            <Row icon={Palette} label="Accent" right={
              <div className="flex gap-2">
                {["bg-zinc-900", "bg-emerald-700", "bg-amber-700", "bg-blue-700"].map((c, i) => (
                  <button key={c} aria-label={`accent-${i}`} className={`size-5 rounded-full ${c} ring-2 ring-offset-2 ${i === 0 ? "ring-zinc-900" : "ring-transparent"}`} />
                ))}
              </div>
            } />
          </div>
        </Card>
      </section>

      {/* Privacy & data */}
      <section className="px-6 mb-6">
        <SectionLabel>Privacy & data</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            {[
              { icon: Shield, label: "Privacy center", hint: "See everything I read", to: "/privacy" },
              { icon: Lock, label: "Security & 2FA", hint: "Two-factor auth, breach checks, protections", to: "/security" },
              { icon: Users, label: "Roles & access", hint: "Nannies, coaches, guests", to: "/providers" },
              { icon: Wallet, label: "Plan & billing", hint: "Free · upgrade anytime", to: "/plans" },
            ].map((r) => (
              <Link key={r.to} to={r.to} className="flex items-center">
                <Row
                  icon={r.icon}
                  label={r.label}
                  hint={r.hint}
                  right={<ChevronRight className="size-4 text-muted-foreground" />}
                />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* Billing */}
      <section className="px-6 mb-6">
        <SectionLabel>Billing</SectionLabel>
        <Card>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Current plan
            </p>
            <p className="mt-1 font-serif text-[18px] italic capitalize">
              {tier === "free" ? "Free" : tier === "max" ? "Pro Max" : "Family COO Pro"}
            </p>
          </div>
          {isActive ? (
            isNative() ? (
              <button
                onClick={() =>
                  openExternal(
                    isIOS()
                      ? "https://apps.apple.com/account/subscriptions"
                      : "https://play.google.com/store/account/subscriptions",
                  )
                }
                className="w-full rounded-full border border-hairline bg-white px-4 py-2.5 text-[12px] font-medium uppercase tracking-widest text-foreground"
              >
                Manage subscription in {isIOS() ? "App Store" : "Google Play"}
              </button>
            ) : (
            <button
              onClick={async () => {
                if (portalBusy) return;
                setPortalBusy(true);
                try {
                  const res = await openPortalFn();
                  const url = res.overviewUrl;
                  if (url) window.open(url, "_blank", "noopener");
                  else window.alert("Could not open billing portal.");
                } catch (e) {
                  window.alert(e instanceof Error ? e.message : "Could not open portal");
                } finally {
                  setPortalBusy(false);
                }
              }}
              disabled={portalBusy}
              className="w-full rounded-full border border-hairline bg-white px-4 py-2.5 text-[12px] font-medium uppercase tracking-widest text-foreground disabled:opacity-60"
            >
              {portalBusy ? "Opening…" : "Manage billing & payment method"}
            </button>
            )

          ) : (
            <Link
              to="/plans"
              className="block w-full rounded-full bg-zinc-900 px-4 py-2.5 text-center text-[12px] font-medium uppercase tracking-widest text-white"
            >
              See plans
            </Link>
          )}
        </Card>
      </section>

      {/* Account */}
      <section className="px-6 mb-10">
        <SectionLabel>Account</SectionLabel>
        <Card>
          {user?.email && (
            <p className="mb-4 text-[12px] text-muted-foreground">
              Signed in as <span className="text-foreground">{user.email}</span>
            </p>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              // Clear cached queries so a subsequent sign-in on the same
              // device doesn't briefly show the previous user's data.
              queryClient.clear();
              navigate({ to: "/auth", replace: true });
            }}
            className="flex w-full items-center gap-3 py-2 text-left text-[14px] text-foreground"
          >
            Sign out
          </button>
          <button
            onClick={async () => {
              const confirmed = window.confirm(
                "Permanently delete your account? This cancels any active subscription and removes your profile, household, and all associated data. This cannot be undone.",
              );
              if (!confirmed) return;
              try {
                await deleteFn({});
                await supabase.auth.signOut();
                queryClient.clear();
                navigate({ to: "/auth", replace: true });
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "Failed to delete account");
              }
            }}
            className="mt-2 flex w-full items-center gap-3 py-2 text-left text-[14px] text-red-700"
          >
            Delete account permanently
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Version 1.0.0 · Deleting cancels billing and removes all your data.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
