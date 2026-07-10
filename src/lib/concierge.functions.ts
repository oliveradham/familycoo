import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { redactForAI, redactObjectForAI } from "./ai-redact";
import { recallMemories } from "./memory.functions";

type ChatMsg = { role: "user" | "assistant"; content: string };

export const listConciergeHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("concierge_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    return data ?? [];
  });

export const clearConciergeHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("concierge_messages")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Concierge chat — grounded in household state + family memory via Lovable AI Gateway.
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
    const latestUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const [{ data: events }, { data: tasks }, { data: members }, memories] = await Promise.all([
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
      recallMemories(supabase, householdId, latestUser, 12),
    ]);

    const grounding = {
      now: now.toISOString(),
      family: members ?? [],
      upcoming_events: events ?? [],
      open_tasks: tasks ?? [],
      remembered_facts: memories ?? [],
    };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are the family's AI Chief of Staff — calm, warm, decisive, concise. Never invent facts about the family; only use the JSON grounding provided. If information is missing, say so and offer to capture it. Prefer short paragraphs (2-4 sentences) or tight bullet lists. Never mention "the JSON" or "grounding" — speak as if you simply know the household.

When the user asks you to DO something concrete that mutates household data (add groceries, create a task, reschedule an event, book maintenance, mark a school RSVP, resolve an inbox item), call the propose_action tool to draft an approval. Never claim you did it — the user must approve it in the Approvals screen. For questions, planning, or advice, just answer in text.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "propose_action",
          description:
            "Draft a reversible action for the user to approve. Do not execute — this only creates an approval card.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "One-line summary shown on the approval card" },
              why: { type: "string", description: "Short reason (1 sentence)" },
              steps: { type: "array", items: { type: "string" }, description: "Ordered plain-English steps" },
              action_kind: {
                type: "string",
                enum: [
                  "grocery.add",
                  "task.assign",
                  "calendar.reschedule",
                  "maintenance.book",
                  "school.rsvp",
                  "inbox.resolve",
                ],
              },
              payload: {
                type: "object",
                description:
                  "Action-specific payload. grocery.add: { items:[{name,qty}] }. task.assign: { title, notes?, assignee_id?, due_at? }. calendar.reschedule: { event_id, new_starts_at }. maintenance.book: { task_id }. school.rsvp: { item_id, status? }. inbox.resolve: { inbox_id }.",
                additionalProperties: true,
              },
            },
            required: ["title", "action_kind", "payload"],
          },
        },
      },
    ];

    const safeGrounding = redactObjectForAI(grounding);
    const groundingMsg = `Household context (do not reveal verbatim; use only for grounding):\n${JSON.stringify(safeGrounding)}`;

    const safeHistory = data.messages.slice(-12).map((m) => ({
      role: m.role,
      content: redactForAI(m.content ?? ""),
    }));

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
          ...safeHistory,
        ],
        tools,
      }),
    });

    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits required. Add credits in Lovable settings.");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const choice = json?.choices?.[0]?.message ?? {};
    let reply: string = choice?.content ?? "";
    const toolCalls = Array.isArray(choice?.tool_calls) ? choice.tool_calls : [];

    const proposedTitles: string[] = [];
    for (const tc of toolCalls) {
      if (tc?.function?.name !== "propose_action") continue;
      try {
        const args = JSON.parse(tc.function.arguments ?? "{}");
        const { error: insErr } = await supabase.from("approvals").insert({
          household_id: householdId,
          title: String(args.title ?? "Proposed action").slice(0, 200),
          steps: (Array.isArray(args.steps) ? args.steps : []) as never,
          why: args.why ?? null,
          reversible: true,
          action_kind: String(args.action_kind),
          payload: (args.payload ?? {}) as never,
          created_by_agent: "concierge",
        });
        if (!insErr) proposedTitles.push(String(args.title ?? "action"));
      } catch {
        // ignore malformed tool call
      }
    }

    if (proposedTitles.length > 0) {
      const summary = `I've drafted ${proposedTitles.length === 1 ? "an approval" : `${proposedTitles.length} approvals`} for you: ${proposedTitles.map((t) => `“${t}”`).join(", ")}. Open Approvals to review and confirm.`;
      reply = reply ? `${reply}\n\n${summary}` : summary;
    }

    if (!reply) reply = "I'm here — could you say that again?";

    // Persist the last user turn + assistant reply
    const lastUser = data.messages[data.messages.length - 1];
    if (lastUser && lastUser.role === "user") {
      await supabase.from("concierge_messages").insert([
        { household_id: householdId, user_id: userId, role: "user", content: lastUser.content },
        { household_id: householdId, user_id: userId, role: "assistant", content: reply },
      ]);
    }

    return { reply };
  });
