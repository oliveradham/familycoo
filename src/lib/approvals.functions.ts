import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getHouseholdId(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No household");
  return data.household_id as string;
}

export const listApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const household_id = await getHouseholdId(supabase, userId);
    const { data, error } = await supabase
      .from("approvals")
      .select(
        "id, title, steps, why, reversible, action_kind, payload, status, created_by_agent, executed_at, error, undo_expires_at, created_at",
      )
      .eq("household_id", household_id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const approveAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const household_id = await getHouseholdId(supabase, userId);

    const { data: approval, error: fErr } = await supabase
      .from("approvals")
      .select("id, action_kind, payload, status, household_id, reversible")
      .eq("id", data.id)
      .eq("household_id", household_id)
      .maybeSingle();
    if (fErr || !approval) throw new Error(fErr?.message ?? "Approval not found");
    if (approval.status !== "pending") throw new Error(`Already ${approval.status}`);

    const { executeAction } = await import("./actions.server");
    const result = await executeAction(
      supabase,
      household_id,
      approval.action_kind,
      approval.payload,
    );

    if (!result.ok) {
      await supabase
        .from("approvals")
        .update({ status: "failed", error: result.error })
        .eq("id", data.id);
      throw new Error(result.error);
    }

    const undoExpires = approval.reversible
      ? new Date(Date.now() + 24 * 3600_000).toISOString()
      : null;

    await supabase
      .from("approvals")
      .update({
        status: "executed",
        executed_at: new Date().toISOString(),
        undo_token: result.undo as never,
        undo_expires_at: undoExpires,
        error: null,
      })
      .eq("id", data.id);

    return { ok: true };
  });

export const rejectApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const household_id = await getHouseholdId(supabase, userId);
    const { error } = await supabase
      .from("approvals")
      .update({ status: "rejected" })
      .eq("id", data.id)
      .eq("household_id", household_id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const undoApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const household_id = await getHouseholdId(supabase, userId);

    const { data: approval } = await supabase
      .from("approvals")
      .select("id, action_kind, undo_token, undo_expires_at, status, household_id")
      .eq("id", data.id)
      .eq("household_id", household_id)
      .maybeSingle();
    if (!approval) throw new Error("Not found");
    if (approval.status !== "executed") throw new Error("Not executed");
    if (!approval.undo_expires_at || new Date(approval.undo_expires_at) < new Date()) {
      throw new Error("Undo window expired");
    }

    const { undoAction } = await import("./actions.server");
    await undoAction(supabase, household_id, approval.action_kind, approval.undo_token);

    await supabase
      .from("approvals")
      .update({ status: "rejected", error: "Undone by user" })
      .eq("id", data.id);
    return { ok: true };
  });

export const createApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      title: string;
      steps?: string[];
      why?: string;
      reversible?: boolean;
      action_kind: string;
      payload?: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const household_id = await getHouseholdId(supabase, userId);
    const { data: row, error } = await supabase
      .from("approvals")
      .insert({
        household_id,
        title: data.title,
        steps: (data.steps ?? []) as never,
        why: data.why ?? null,
        reversible: data.reversible ?? true,
        action_kind: data.action_kind,
        payload: (data.payload ?? {}) as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
