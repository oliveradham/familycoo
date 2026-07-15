import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listSchoolItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: membership, error: membershipError } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) return [];
    const householdId = membership.household_id as string;
    const { data, error } = await supabase
      .from("school_items")
      .select("*")
      .eq("household_id", householdId)
      .order("status", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createSchoolItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        title: z.string().min(1).max(280),
        kind: z.enum(["tuition", "homework", "event", "email_summary", "permission_slip", "other"]).default("other"),
        detail: z.string().max(4000).optional(),
        due_at: z.string().datetime().optional().nullable(),
        amount_cents: z.number().int().nonnegative().optional().nullable(),
        kid_id: z.string().uuid().optional().nullable(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: membership, error: membershipError } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) throw new Error("No household found for user");
    const householdId = membership.household_id as string;
    const { data: row, error } = await supabase
      .from("school_items")
      .insert({
        household_id: householdId,
        title: data.title,
        kind: data.kind,
        detail: data.detail ?? null,
        due_at: data.due_at ?? null,
        amount_cents: data.amount_cents ?? null,
        kid_id: data.kid_id ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const setSchoolItemStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "done", "archived"]) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("school_items")
      .update({ status: data.status })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteSchoolItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("school_items").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
