// Server-only action executor for approvals. Each ActionKind maps to a pure
// handler that mutates household data and returns an undo snapshot. Import
// only inside server function handlers.
import type { SupabaseClient } from "@supabase/supabase-js";

type Sb = SupabaseClient;

export type ActionKind =
  | "grocery.add"
  | "task.assign"
  | "calendar.reschedule"
  | "maintenance.book"
  | "school.rsvp"
  | "inbox.resolve";

export type ExecuteResult = { ok: true; undo: unknown } | { ok: false; error: string };

/** Registry entry: execute mutates; undo replays the snapshot. */
type Handler = {
  execute: (sb: Sb, household_id: string, payload: any) => Promise<ExecuteResult>;
  undo: (sb: Sb, household_id: string, snapshot: any) => Promise<void>;
};

const handlers: Record<ActionKind, Handler> = {
  "grocery.add": {
    execute: async (sb, household_id, payload) => {
      const items = Array.isArray(payload?.items) ? payload.items : [];
      if (items.length === 0) return { ok: false, error: "No items" };
      const rows = items.map((i: any) => ({
        household_id,
        name: String(i.name ?? "").slice(0, 200),
        qty: Number(i.qty ?? 1),
        status: "todo",
      }));
      const { data, error } = await sb.from("grocery_items").insert(rows).select("id");
      if (error) return { ok: false, error: error.message };
      return { ok: true, undo: { ids: (data ?? []).map((r: any) => r.id) } };
    },
    undo: async (sb, _hid, snap) => {
      const ids = (snap?.ids ?? []) as string[];
      if (ids.length) await sb.from("grocery_items").delete().in("id", ids);
    },
  },
  "task.assign": {
    execute: async (sb, household_id, payload) => {
      const { data, error } = await sb
        .from("tasks")
        .insert({
          household_id,
          title: String(payload?.title ?? "Untitled").slice(0, 200),
          notes: payload?.notes ?? null,
          assignee_id: payload?.assignee_id ?? null,
          due_at: payload?.due_at ?? null,
          status: "todo",
        })
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, undo: { id: data.id } };
    },
    undo: async (sb, _hid, snap) => {
      if (snap?.id) await sb.from("tasks").delete().eq("id", snap.id);
    },
  },
  "calendar.reschedule": {
    execute: async (sb, household_id, payload) => {
      const id = payload?.event_id;
      const new_starts_at = payload?.new_starts_at;
      if (!id || !new_starts_at) return { ok: false, error: "Missing event_id/new_starts_at" };
      const { data: before, error: fErr } = await sb
        .from("calendar_events")
        .select("id, starts_at, ends_at")
        .eq("id", id)
        .eq("household_id", household_id)
        .maybeSingle();
      if (fErr || !before) return { ok: false, error: fErr?.message ?? "Event not found" };
      // Shift ends_at by same delta if present.
      let new_ends_at: string | null = null;
      if (before.ends_at) {
        const delta = new Date(new_starts_at).getTime() - new Date(before.starts_at).getTime();
        new_ends_at = new Date(new Date(before.ends_at).getTime() + delta).toISOString();
      }
      const { error: uErr } = await sb
        .from("calendar_events")
        .update({ starts_at: new_starts_at, ends_at: new_ends_at ?? before.ends_at })
        .eq("id", id);
      if (uErr) return { ok: false, error: uErr.message };
      return { ok: true, undo: { id, starts_at: before.starts_at, ends_at: before.ends_at } };
    },
    undo: async (sb, _hid, snap) => {
      if (!snap?.id) return;
      await sb
        .from("calendar_events")
        .update({ starts_at: snap.starts_at, ends_at: snap.ends_at })
        .eq("id", snap.id);
    },
  },
  "maintenance.book": {
    execute: async (sb, household_id, payload) => {
      const id = payload?.task_id;
      if (!id) return { ok: false, error: "Missing task_id" };
      const { data: before } = await sb
        .from("maintenance_tasks")
        .select("id, status, next_due_on")
        .eq("id", id)
        .eq("household_id", household_id)
        .maybeSingle();
      if (!before) return { ok: false, error: "Maintenance task not found" };
      const { error } = await sb
        .from("maintenance_tasks")
        .update({ status: "scheduled" })
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      return { ok: true, undo: { id, status: before.status } };
    },
    undo: async (sb, _hid, snap) => {
      if (!snap?.id) return;
      await sb.from("maintenance_tasks").update({ status: snap.status }).eq("id", snap.id);
    },
  },
  "school.rsvp": {
    execute: async (sb, household_id, payload) => {
      const id = payload?.item_id;
      const next = payload?.status ?? "done";
      if (!id) return { ok: false, error: "Missing item_id" };
      const { data: before } = await sb
        .from("school_items")
        .select("id, status")
        .eq("id", id)
        .eq("household_id", household_id)
        .maybeSingle();
      if (!before) return { ok: false, error: "School item not found" };
      const { error } = await sb.from("school_items").update({ status: next }).eq("id", id);
      if (error) return { ok: false, error: error.message };
      return { ok: true, undo: { id, status: before.status } };
    },
    undo: async (sb, _hid, snap) => {
      if (!snap?.id) return;
      await sb.from("school_items").update({ status: snap.status }).eq("id", snap.id);
    },
  },
  "inbox.resolve": {
    execute: async (sb, household_id, payload) => {
      const id = payload?.inbox_id;
      if (!id) return { ok: false, error: "Missing inbox_id" };
      const { data: before } = await sb
        .from("inbox_items")
        .select("id, status")
        .eq("id", id)
        .eq("household_id", household_id)
        .maybeSingle();
      if (!before) return { ok: false, error: "Inbox item not found" };
      await sb.from("inbox_items").update({ status: "resolved" }).eq("id", id);
      return { ok: true, undo: { id, status: before.status } };
    },
    undo: async (sb, _hid, snap) => {
      if (!snap?.id) return;
      await sb.from("inbox_items").update({ status: snap.status }).eq("id", snap.id);
    },
  },
};

export async function executeAction(
  sb: Sb,
  household_id: string,
  kind: string,
  payload: unknown,
): Promise<ExecuteResult> {
  const h = handlers[kind as ActionKind];
  if (!h) return { ok: false, error: `Unknown action_kind: ${kind}` };
  return h.execute(sb, household_id, payload);
}

export async function undoAction(
  sb: Sb,
  household_id: string,
  kind: string,
  snapshot: unknown,
): Promise<void> {
  const h = handlers[kind as ActionKind];
  if (!h) return;
  await h.undo(sb, household_id, snapshot);
}
