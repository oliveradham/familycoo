// Server-only weekly review generator. Load from cron routes.
import type { SupabaseClient } from "@supabase/supabase-js";
import { redactObjectForAI } from "./ai-redact";

type Sb = SupabaseClient;

const SYSTEM_PROMPT =
  "You are the Family Chief of Staff. Write a calm, editorial Sunday review of the past week and preview the week ahead. Warm, specific, never alarmist. Use only facts from the grounding data.";

export type WeeklyReviewContent = {
  headline: string;
  summary: string;
  wins: string[];
  upcoming: { title: string; when: string }[];
  stats: {
    tasks_completed: number;
    events_count: number;
    total_spent_cents: number;
  };
};

function weekStart(d: Date): Date {
  const day = d.getUTCDay(); // Sunday = 0
  const diff = -day;
  const s = new Date(d);
  s.setUTCDate(s.getUTCDate() + diff);
  s.setUTCHours(0, 0, 0, 0);
  return s;
}

export async function generateWeeklyReview(
  supabase: Sb,
  household_id: string,
): Promise<WeeklyReviewContent | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const now = new Date();
  const start = weekStart(now);
  const startIso = start.toISOString();
  const nextWeekEnd = new Date(start.getTime() + 14 * 86_400_000).toISOString();

  const [{ data: doneTasks }, { data: pastEvents }, { data: upcoming }, { data: expenses }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("title, category, updated_at")
        .eq("household_id", household_id)
        .eq("status", "done")
        .gte("updated_at", new Date(start.getTime() - 7 * 86_400_000).toISOString())
        .lte("updated_at", startIso)
        .limit(50),
      supabase
        .from("calendar_events")
        .select("title, starts_at, category")
        .eq("household_id", household_id)
        .gte("starts_at", new Date(start.getTime() - 7 * 86_400_000).toISOString())
        .lte("starts_at", startIso)
        .limit(50),
      supabase
        .from("calendar_events")
        .select("title, starts_at, category")
        .eq("household_id", household_id)
        .gte("starts_at", startIso)
        .lte("starts_at", nextWeekEnd)
        .order("starts_at", { ascending: true })
        .limit(20),
      supabase
        .from("expenses")
        .select("amount_cents, category, occurred_at")
        .eq("household_id", household_id)
        .gte("occurred_at", new Date(start.getTime() - 7 * 86_400_000).toISOString().slice(0, 10))
        .lte("occurred_at", startIso.slice(0, 10))
        .limit(200),
    ]);

  const totalSpent = (expenses ?? []).reduce(
    (sum: number, e: { amount_cents: number | null }) => sum + (e.amount_cents ?? 0),
    0,
  );

  const grounding = {
    week_start: startIso.slice(0, 10),
    tasks_completed: doneTasks ?? [],
    past_events: pastEvents ?? [],
    upcoming_events: upcoming ?? [],
    expenses_summary: {
      count: expenses?.length ?? 0,
      total_cents: totalSpent,
    },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Grounding data:\n${JSON.stringify(redactObjectForAI(grounding), null, 2)}\n\nReturn JSON: { "headline": string (max 70 chars), "summary": string (3-4 sentences), "wins": string[] (3-5 concrete wins from tasks_completed/past_events), "upcoming": [{"title": string, "when": string}] (3-6 items from upcoming_events, ISO date or friendly day) }. Never invent facts.`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: [{ message?: { content?: string } }] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  const parsed = JSON.parse(content) as Omit<WeeklyReviewContent, "stats">;

  return {
    headline: parsed.headline,
    summary: parsed.summary,
    wins: parsed.wins ?? [],
    upcoming: parsed.upcoming ?? [],
    stats: {
      tasks_completed: doneTasks?.length ?? 0,
      events_count: pastEvents?.length ?? 0,
      total_spent_cents: totalSpent,
    },
  };
}

export function currentWeekStartIso(now = new Date()): string {
  return weekStart(now).toISOString().slice(0, 10);
}
