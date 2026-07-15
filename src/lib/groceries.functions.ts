import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listGroceries = createServerFn({ method: "GET" })
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
      .from("grocery_items")
      .select("id, name, qty, unit, category, status, low_at, notes, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createGrocery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; qty?: number | null; unit?: string | null; category?: string; status?: string }) => {
    if (!input?.name?.trim()) throw new Error("name required");
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
      .from("grocery_items")
      .insert({
        household_id: householdId,
        name: data.name.trim(),
        qty: data.qty ?? null,
        unit: data.unit || null,
        category: data.category || "other",
        status: data.status || "need",
      })
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const setGroceryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => {
    if (!input?.id || !input?.status) throw new Error("id + status required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("grocery_items")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteGrocery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("grocery_items").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
