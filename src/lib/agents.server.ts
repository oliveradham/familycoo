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

async function draftApproval(
  supabase: Sb,
  household_id: string,
  input: {
    title: string;
    steps: string[];
    why: string;
    reversible?: boolean;
    action_kind: string;
    payload: Record<string, unknown>;
    created_by_agent: string;
    dedupe_key?: string;
  },
): Promise<boolean> {
  // Dedupe: skip if a pending approval with matching action_kind + dedupe_key
  // already exists in the last 48h.
  if (input.dedupe_key) {
    const since = new Date(Date.now() - 48 * 3600_000).toISOString();
    const { data: existing } = await supabase
      .from("approvals")
      .select("id, payload")
      .eq("household_id", household_id)
      .eq("action_kind", input.action_kind)
      .eq("status", "pending")
      .gte("created_at", since)
      .limit(50);
    if ((existing ?? []).some((r: any) => r.payload?.__dedupe === input.dedupe_key)) {
      return false;
    }
  }
  const payload = { ...input.payload, __dedupe: input.dedupe_key };
  const { error } = await supabase.from("approvals").insert({
    household_id,
    title: input.title,
    steps: input.steps as never,
    why: input.why,
    reversible: input.reversible ?? true,
    action_kind: input.action_kind,
    payload: payload as never,
    created_by_agent: input.created_by_agent,
  });
  return !error;
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

      // Propose: push event B by 1h.
      const newStart = new Date(aEnd + 15 * 60_000).toISOString();
      const ok = await draftApproval(supabase, household_id, {
        title: `Reschedule "${b.title}" after "${a.title}"`,
        steps: [
          `Detected overlap on ${new Date(a.starts_at).toLocaleString()}.`,
          `Move "${b.title}" to ${new Date(newStart).toLocaleString()}.`,
          `Original time is preserved for one-tap undo.`,
        ],
        why: `"${a.title}" and "${b.title}" overlap. Rescheduling the later-created one clears the conflict.`,
        action_kind: "calendar.reschedule",
        payload: { event_id: b.id, new_starts_at: newStart },
        created_by_agent: "conflict",
        dedupe_key: `${a.id}:${b.id}`,
      });
      if (ok) {
        const { notifyHousehold } = await import("./notify.server");
        await notifyHousehold(supabase, {
          household_id,
          kind: "agent:conflict",
          subject: `Schedule conflict: "${a.title}"`,
          body: `Overlaps with "${b.title}". Tap to review the proposed fix.`,
          url: "/approvals",
          ref_id: `conflict:${a.id}:${b.id}`,
          dedupe_hours: 24,
        });
        created++;
      }
    }
  }
  await logRun(supabase, household_id, "conflict", `Scanned ${events.length} events, ${created} drafts`, created);
  return created;
}

export async function runPrepAgent(supabase: Sb, household_id: string) {
  const now = new Date();
  const in48 = new Date(now.getTime() + 48 * 3600_000).toISOString();
  const { data: school } = await supabase
    .from("school_items")
    .select("id, title, due_at, status, assignee_id")
    .eq("household_id", household_id)
    .neq("status", "done")
    .gte("due_at", now.toISOString())
    .lte("due_at", in48);

  let created = 0;
  for (const item of school ?? []) {
    const ok = await draftApproval(supabase, household_id, {
      title: `Create prep task: ${item.title}`,
      steps: [
        `School item "${item.title}" is due ${item.due_at ? new Date(item.due_at).toLocaleString() : "soon"}.`,
        `Add a task to a parent's list to handle signature, packing, or drop-off.`,
        `Marked reversible — task can be deleted with undo.`,
      ],
      why: `Due within 48 hours and not yet marked done.`,
      action_kind: "task.assign",
      payload: {
        title: `Prep: ${item.title}`,
        notes: `Auto-drafted from school item ${item.id}.`,
        assignee_id: item.assignee_id ?? null,
        due_at: item.due_at ?? null,
      },
      created_by_agent: "prep",
      dedupe_key: `school:${item.id}`,
    });
    if (ok) created++;
  }
  await logRun(supabase, household_id, "prep", `${created} prep drafts`, created);
  return created;
}

/** Low-stock grocery items (below low_at threshold). Bundles into one approval. */
export async function runRestockAgent(supabase: Sb, household_id: string) {
  const { data } = await supabase
    .from("grocery_items")
    .select("id, name, qty, low_at, status")
    .eq("household_id", household_id)
    .neq("status", "purchased");

  const low: Array<{ name: string; qty: number }> = [];
  for (const item of data ?? []) {
    const qty = item.qty ?? 0;
    const l = item.low_at ?? null;
    if (l == null || qty > l) continue;
    low.push({ name: item.name, qty: 1 });
  }
  if (low.length === 0) {
    await logRun(supabase, household_id, "restock", "Nothing low", 0);
    return 0;
  }

  const dedupe = `restock:${low
    .map((i) => i.name)
    .sort()
    .join("|")}`;
  const ok = await draftApproval(supabase, household_id, {
    title: `Add ${low.length} low-stock items to grocery list`,
    steps: [
      `Detected ${low.length} items below their low-stock threshold.`,
      `Items: ${low.map((i) => i.name).join(", ")}.`,
      `Adds one grocery entry per item. Undoable within 24 hours.`,
    ],
    why: `Restock threshold reached for these items.`,
    action_kind: "grocery.add",
    payload: { items: low },
    created_by_agent: "restock",
    dedupe_key: dedupe,
  });
  const created = ok ? 1 : 0;
  await logRun(supabase, household_id, "restock", `${created} restock draft`, created);
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
    const ok = await draftApproval(supabase, household_id, {
      title: `Mark "${t.title}" as scheduled`,
      steps: [
        `Maintenance task "${t.title}" is due ${t.next_due_on}.`,
        `Sets status to "scheduled" so it stops nudging.`,
        `Undoable — reverts to previous status.`,
      ],
      why: `Due within 7 days.`,
      action_kind: "maintenance.book",
      payload: { task_id: t.id },
      created_by_agent: "maintenance",
      dedupe_key: `maint:${t.id}`,
    });
    if (ok) created++;
  }
  await logRun(supabase, household_id, "maintenance", `${created} maintenance drafts`, created);
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
