import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMaintenance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: membership, error: membershipError } = await context.supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) return [];
    const householdId = membership.household_id as string;
    const { data, error } = await context.supabase
      .from("maintenance_tasks")
      .select("id, title, area, frequency_days, last_done_on, next_due_on, vendor, notes, created_at")
      .eq("household_id", householdId)
      .order("next_due_on", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  });

export const createMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; area?: string; frequency_days?: number | null; next_due_on?: string | null; vendor?: string | null; notes?: string | null }) => {
    if (!input?.title?.trim()) throw new Error("title required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: membership, error: membershipError } = await context.supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) throw new Error("No household");
    const householdId = membership.household_id as string;
    const { data: row, error } = await context.supabase
      .from("maintenance_tasks")
      .insert({
        household_id: householdId,
        title: data.title.trim(),
        area: data.area || "home",
        frequency_days: data.frequency_days ?? null,
        next_due_on: data.next_due_on || null,
        vendor: data.vendor || null,
        notes: data.notes || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const markMaintenanceDone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: row, error: readErr } = await context.supabase
      .from("maintenance_tasks")
      .select("frequency_days")
      .eq("id", data.id)
      .single();
    if (readErr) throw readErr;
    const today = new Date().toISOString().slice(0, 10);
    const next = row?.frequency_days
      ? (() => {
          const d = new Date(today);
          d.setDate(d.getDate() + row.frequency_days);
          return d.toISOString().slice(0, 10);
        })()
      : null;
    const { error } = await context.supabase
      .from("maintenance_tasks")
      .update({ last_done_on: today, next_due_on: next })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true, next_due_on: next };
  });

export const deleteMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("maintenance_tasks").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
