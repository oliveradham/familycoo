import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listTasks = createServerFn({ method: "GET" })
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
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .order("status", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        title: z.string().min(1).max(280),
        notes: z.string().max(2000).optional(),
        due_at: z.string().datetime().optional().nullable(),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
        category: z.string().max(80).optional(),
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
      .from("tasks")
      .insert({
        household_id: householdId,
        title: data.title,
        notes: data.notes ?? null,
        due_at: data.due_at ?? null,
        priority: data.priority,
        category: data.category ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const setTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "done"]) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("tasks")
      .update({
        status: data.status,
        completed_at: data.status === "done" ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
