import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listExpenses = createServerFn({ method: "GET" })
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
      .from("expenses")
      .select("id, family_member_id, amount_cents, currency, category, merchant, spent_on, notes, is_recurring, subscription_period, created_at")
      .eq("household_id", householdId)
      .order("spent_on", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const createExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    amount_cents: number;
    currency?: string;
    category?: string;
    merchant?: string | null;
    spent_on?: string | null;
    notes?: string | null;
    family_member_id?: string | null;
    is_recurring?: boolean;
    subscription_period?: string | null;
  }) => {
    if (typeof input?.amount_cents !== "number") throw new Error("amount required");
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
      .from("expenses")
      .insert({
        household_id: householdId,
        amount_cents: data.amount_cents,
        currency: data.currency || "USD",
        category: data.category || "other",
        merchant: data.merchant || undefined,
        spent_on: data.spent_on || undefined,
        notes: data.notes || null,
        family_member_id: data.family_member_id || null,
        is_recurring: !!data.is_recurring,
        subscription_period: data.subscription_period || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("expenses").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
