import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function resolveHousehold(supabase: any, userId: string) {
  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new Error("No household");
  return data.household_id as string;
}

export const listExpenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const householdId = await resolveHousehold(context.supabase, context.userId);
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
    const householdId = await resolveHousehold(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("expenses")
      .insert({
        household_id: householdId,
        amount_cents: data.amount_cents,
        currency: data.currency || "USD",
        category: data.category || "other",
        merchant: data.merchant || null,
        spent_on: data.spent_on || null,
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
