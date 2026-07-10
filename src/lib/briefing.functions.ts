import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { redactObjectForAI } from "./ai-redact";

/**
 * Generates a fresh morning briefing for the user's household using
 * Lovable AI Gateway, grounded in the household's real tasks + events.
 *
 * Returns { headline, summary, highlights: string[], suggested: string[] }.
 */
export const generateMorningBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Resolve household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!membership) throw new Error("No household");
    const householdId = membership.household_id as string;

    // Ground the briefing in real data (today + next 48h)
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();

    const [{ data: events }, { data: tasks }, { data: members }] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("title, starts_at, location, category")
        .eq("household_id", householdId)
        .gte("starts_at", now.toISOString())
        .lte("starts_at", in48h)
        .order("starts_at", { ascending: true })
        .limit(20),
      supabase
        .from("tasks")
        .select("title, due_at, priority, status, category")
        .eq("household_id", householdId)
        .eq("status", "open")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(20),
      supabase
        .from("family_members")
        .select("name, role")
        .eq("household_id", householdId)
        .limit(20),
    ]);

    const grounding = {
      today: now.toISOString(),
      family: members ?? [],
      events: events ?? [],
      open_tasks: tasks ?? [],
    };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are the Family Chief of Staff. Write a calm, warm, concise morning briefing for busy parents. Never invent facts — only use what's in the JSON grounding provided by the user. If a section has no data, say so gently. Tone: Apple-editorial, supportive, never alarmist. Output MUST be valid JSON matching the schema.`;

    const userPrompt = `Household grounding data:\n${JSON.stringify(grounding, null, 2)}\n\nReturn JSON: { "headline": string (max 60 chars, one warm line), "summary": string (2-3 sentences, editorial), "highlights": string[] (3-5 short bullets pulled from real events/tasks), "suggested": string[] (2-3 gentle suggestions or nudges) }`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
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
    let parsed: {
      headline: string;
      summary: string;
      highlights: string[];
      suggested: string[];
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        headline: "Good morning",
        summary: raw.slice(0, 400),
        highlights: [],
        suggested: [],
      };
    }

    // Persist today's briefing
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from("briefings")
      .upsert(
        {
          household_id: householdId,
          kind: "morning",
          briefing_date: today,
          content: parsed,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "household_id,kind,briefing_date" },
      );

    return parsed;
  });

export const getTodaysBriefing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!membership) return null;

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("briefings")
      .select("content, generated_at")
      .eq("household_id", membership.household_id)
      .eq("kind", "morning")
      .eq("briefing_date", today)
      .maybeSingle();
    return data;
  });
