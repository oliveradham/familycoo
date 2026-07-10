// Server-only helpers for briefing generation. Loaded from server functions
// and cron routes; never import from client-reachable modules directly.
import { redactObjectForAI } from "./ai-redact";

export type BriefingKind = "morning" | "afternoon" | "evening";

export type Briefing = {
  headline: string;
  summary: string;
  highlights: string[];
  suggested: string[];
};

const SYSTEM_PROMPTS: Record<BriefingKind, string> = {
  morning:
    "You are the Family Chief of Staff. Write a calm, warm morning briefing for busy parents. Focus on the day ahead: schedule, priorities, prep. Tone: Apple-editorial, supportive, never alarmist.",
  afternoon:
    "You are the Family Chief of Staff. Write a mid-day check-in. Focus on what's coming this afternoon and evening: pickups, homework, dinner, unresolved items. Concise and calm.",
  evening:
    "You are the Family Chief of Staff. Write an evening wrap-up. Recap what went well, then surface tomorrow's prep (lunches, forms, gear, early wake-ups). Warm and reassuring.",
};

export async function generateBriefingContent(
  kind: BriefingKind,
  grounding: unknown,
): Promise<Briefing> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const userPrompt = `Household grounding data:\n${JSON.stringify(
    redactObjectForAI(grounding),
    null,
    2,
  )}\n\nReturn JSON: { "headline": string (max 60 chars), "summary": string (2-3 sentences), "highlights": string[] (3-5 bullets from real events/tasks), "suggested": string[] (2-3 gentle nudges) }. Never invent facts.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[kind] },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw) as Briefing;
  } catch {
    return { headline: "Good " + kind, summary: raw.slice(0, 400), highlights: [], suggested: [] };
  }
}

/**
 * Given a UTC Date, returns true if the profile's briefing-at time in its own
 * timezone falls within the given tolerance window from `now`. Used by the
 * cron dispatcher to fire the right briefing at the right local hour.
 */
export function isTimeDue(
  now: Date,
  hhmm: string | null,
  timezone: string,
  toleranceMinutes = 10,
): boolean {
  if (!hhmm) return false;
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = fmt.formatToParts(now);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const [th, tm] = hhmm.split(":").map(Number);
    const localMinutes = h * 60 + m;
    const targetMinutes = th * 60 + tm;
    const diff = Math.abs(localMinutes - targetMinutes);
    return diff <= toleranceMinutes;
  } catch {
    return false;
  }
}
