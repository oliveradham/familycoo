// Proactive agent logic. Runs against Supabase admin client from a cron route.
// Each agent scans the household's real data and, when it finds something worth
// surfacing, writes an inbox_items row (approval-ready) plus an agent_runs entry.

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
    details: details ?? null,
  });
}

async function pushInbox(
  supabase: Sb,
  household_id: string,
  payload: {
    title: string;
    detail?: string;
    source: string;
    kind: string;
    priority?: string;
  },
) {
  await supabase.from("inbox_items").insert({
    household_id,
    title: payload.title,
    detail: payload.detail ?? null,
    source: payload.source,
    kind: payload.kind,
    priority: payload.priority ?? "normal",
    status: "pending",
  });
}

/** Detect overlapping calendar events in the next 7 days. */
export async function runConflictAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at, ends_at, family_member_id")
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
        title: `Overlap: "${a.title}" and "${b.title}"`,
        detail: `Both fall on ${new Date(a.starts_at).toLocaleString()}. Review who covers each.`,
        source: "agent:conflict",
        kind: "conflict",
        priority: "high",
      });
      created++;
    }
  }
  await logRun(supabase, household_id, "conflict", `Scanned ${events.length} events, ${created} conflicts`, created);
  return created;
}

/** Surface school/sports items due in the next 48h that aren't done. */
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
      title: `Prep: ${item.title}`,
      detail: `Due ${new Date(item.due_at!).toLocaleString()}. Need signature, packing, or drop-off?`,
      source: "agent:prep",
      kind: "prep",
    });
    created++;
  }
  await logRun(supabase, household_id, "prep", `${created} items to prep`, created);
  return created;
}

/** Grocery items past their expected restock cadence. */
export async function runRestockAgent(supabase: Sb, household_id: string) {
  const { data } = await supabase
    .from("grocery_items")
    .select("id, name, status, updated_at, recurring_days")
    .eq("household_id", household_id)
    .eq("status", "purchased");

  let created = 0;
  const now = Date.now();
  for (const item of data ?? []) {
    const cadence = (item as { recurring_days?: number | null }).recurring_days;
    if (!cadence || cadence <= 0) continue;
    const last = new Date(item.updated_at).getTime();
    if (now - last < cadence * 86_400_000) continue;
    await pushInbox(supabase, household_id, {
      title: `Restock: ${item.name}`,
      detail: `Last purchased ${Math.round((now - last) / 86_400_000)} days ago (cadence ${cadence}d).`,
      source: "agent:restock",
      kind: "restock",
    });
    created++;
  }
  await logRun(supabase, household_id, "restock", `${created} restock nudges`, created);
  return created;
}

/** Maintenance tasks whose next_due_on is within 7 days and not complete. */
export async function runMaintenanceAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("maintenance_tasks")
    .select("id, title, next_due_on, status")
    .eq("household_id", household_id)
    .neq("status", "done")
    .gte("next_due_on", now.toISOString().slice(0, 10))
    .lte("next_due_on", in7.slice(0, 10));

  let created = 0;
  for (const t of data ?? []) {
    await pushInbox(supabase, household_id, {
      title: `Maintenance: ${t.title}`,
      detail: `Due ${t.next_due_on}. Book a provider or schedule yourself?`,
      source: "agent:maintenance",
      kind: "maintenance",
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
