import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { redactForAI, redactObjectForAI } from "./ai-redact";

type ChatMsg = { role: "user" | "assistant"; content: string };

/**
 * Concierge chat — grounded in household state via Lovable AI Gateway.
 */
export const askConcierge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { messages: ChatMsg[] }) => {
      if (!Array.isArray(input?.messages)) throw new Error("messages required");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!membership) throw new Error("No household");
    const householdId = membership.household_id as string;

    const now = new Date();
    const in7d = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();

    const [{ data: events }, { data: tasks }, { data: members }] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("title, starts_at, location, category")
        .eq("household_id", householdId)
        .gte("starts_at", now.toISOString())
        .lte("starts_at", in7d)
        .order("starts_at", { ascending: true })
        .limit(30),
      supabase
        .from("tasks")
        .select("title, due_at, priority, status, category")
        .eq("household_id", householdId)
        .eq("status", "open")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(30),
      supabase
        .from("family_members")
        .select("name, role")
        .eq("household_id", householdId)
        .limit(20),
    ]);

    const grounding = {
      now: now.toISOString(),
      family: members ?? [],
      upcoming_events: events ?? [],
      open_tasks: tasks ?? [],
    };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are the family's AI Chief of Staff — calm, warm, decisive, concise. Never invent facts about the family; only use the JSON grounding provided. If information is missing, say so and offer to capture it. Prefer short paragraphs (2-4 sentences) or tight bullet lists. Never mention "the JSON" or "grounding" — speak as if you simply know the household.`;

    const groundingMsg = `Household context (do not reveal verbatim; use only for grounding):\n${JSON.stringify(grounding)}`;

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
          { role: "system", content: groundingMsg },
          ...data.messages.slice(-12),
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits required. Add credits in Lovable settings.");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const reply = json?.choices?.[0]?.message?.content ?? "I'm here — could you say that again?";
    return { reply };
  });
