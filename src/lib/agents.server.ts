// Server-only proactive agents. Load from cron routes only.
import type { SupabaseClient } from "@supabase/supabase-js";

type Sb = SupabaseClient;

async function logRun(
  supabase: Sb,
  household_id: string,
  agent_kind: string,
  summary: string,
  items_created: number,
  details?: unknown,
) {
  await supabase.from("agent_runs").insert({
    household_id,
    agent_kind,
    status: "success",
    summary,
    items_created,
    details: (details ?? null) as never,
  });
}

async function pushInbox(
  supabase: Sb,
  household_id: string,
  payload: { subject: string; summary?: string; source: string; lane?: string; due_at?: string },
) {
  await supabase.from("inbox_items").insert({
    household_id,
    subject: payload.subject,
    summary: payload.summary ?? null,
    source: payload.source,
    lane: payload.lane ?? "review",
    status: "pending",
    due_at: payload.due_at ?? null,
  });
}

export async function runConflictAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at, ends_at")
    .eq("household_id", household_id)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in7d)
    .order("starts_at", { ascending: true });

  if (!events) return 0;
  let created = 0;
  const seen = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      const aStart = new Date(a.starts_at).getTime();
      const aEnd = a.ends_at ? new Date(a.ends_at).getTime() : aStart + 3600_000;
      const bStart = new Date(b.starts_at).getTime();
      if (bStart >= aEnd) break;
      const key = `${a.id}:${b.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await pushInbox(supabase, household_id, {
        subject: `Overlap: "${a.title}" and "${b.title}"`,
        summary: `Both fall on ${new Date(a.starts_at).toLocaleString()}. Review who covers each.`,
        source: "agent:conflict",
        lane: "conflict",
        due_at: a.starts_at,
      });
      const { notifyHousehold } = await import("./notify.server");
      await notifyHousehold(supabase, {
        household_id,
        kind: "agent:conflict",
        subject: `Schedule conflict: "${a.title}"`,
        body: `Overlaps with "${b.title}" on ${new Date(a.starts_at).toLocaleString()}`,
        url: "/approvals",
        ref_id: `conflict:${a.id}:${b.id}`,
        dedupe_hours: 24,
      });
      created++;
    }
  }
  await logRun(supabase, household_id, "conflict", `Scanned ${events.length} events, ${created} conflicts`, created);
  return created;
}

export async function runPrepAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in48 = new Date(now.getTime() + 48 * 3600_000).toISOString();
  const { data: school } = await supabase
    .from("school_items")
    .select("id, title, due_at, status")
    .eq("household_id", household_id)
    .neq("status", "done")
    .gte("due_at", now.toISOString())
    .lte("due_at", in48);

  let created = 0;
  for (const item of school ?? []) {
    await pushInbox(supabase, household_id, {
      subject: `Prep: ${item.title}`,
      summary: `Due ${item.due_at ? new Date(item.due_at).toLocaleString() : "soon"}. Needs signature, packing, or drop-off?`,
      source: "agent:prep",
      lane: "prep",
      due_at: item.due_at ?? undefined,
    });
    created++;
  }
  await logRun(supabase, household_id, "prep", `${created} items to prep`, created);
  return created;
}

/** Low-stock grocery items (below low_at threshold). */
export async function runRestockAgent(supabase: Sb, household_id: string) {
  const { data } = await supabase
    .from("grocery_items")
    .select("id, name, qty, low_at, status")
    .eq("household_id", household_id)
    .neq("status", "purchased");

  let created = 0;
  for (const item of data ?? []) {
    const qty = item.qty ?? 0;
    const low = item.low_at ?? null;
    if (low == null || qty > low) continue;
    await pushInbox(supabase, household_id, {
      subject: `Restock: ${item.name}`,
      summary: `Down to ${qty} (threshold ${low}). Add to next grocery run?`,
      source: "agent:restock",
      lane: "restock",
    });
    created++;
  }
  await logRun(supabase, household_id, "restock", `${created} restock nudges`, created);
  return created;
}

export async function runMaintenanceAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86_400_000);
  const { data } = await supabase
    .from("maintenance_tasks")
    .select("id, title, next_due_on, status")
    .eq("household_id", household_id)
    .neq("status", "done")
    .gte("next_due_on", now.toISOString().slice(0, 10))
    .lte("next_due_on", in7.toISOString().slice(0, 10));

  let created = 0;
  for (const t of data ?? []) {
    await pushInbox(supabase, household_id, {
      subject: `Maintenance: ${t.title}`,
      summary: `Due ${t.next_due_on}. Book a provider or schedule yourself?`,
      source: "agent:maintenance",
      lane: "maintenance",
    });
    created++;
  }
  await logRun(supabase, household_id, "maintenance", `${created} maintenance nudges`, created);
  return created;
}

export async function runAllAgents(supabase: Sb, household_id: string) {
  const [c, p, r, m] = await Promise.all([
    runConflictAgent(supabase, household_id).catch(() => 0),
    runPrepAgent(supabase, household_id).catch(() => 0),
    runRestockAgent(supabase, household_id).catch(() => 0),
    runMaintenanceAgent(supabase, household_id).catch(() => 0),
  ]);
  return { conflict: c, prep: p, restock: r, maintenance: m };
}
