import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMedicalRecords = createServerFn({ method: "GET" })
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
      .from("medical_records")
      .select("id, family_member_id, kind, title, provider, occurred_on, next_due_on, created_at")
      .eq("household_id", householdId)
      .order("occurred_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createMedicalRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    kind?: string;
    family_member_id?: string | null;
    provider?: string | null;
    occurred_on?: string | null;
    next_due_on?: string | null;
    detail?: string | null;
    policy_number?: string | null;
  }) => {
    if (!input?.title?.trim()) throw new Error("Title required");
    return input;
  })
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
    if (!membership) throw new Error("No household");
    const householdId = membership.household_id as string;
    const { encryptField } = await import("./field-crypto.server");
    const { data: row, error } = await supabase
      .from("medical_records")
      .insert({
        household_id: householdId,
        title: data.title.trim(),
        kind: data.kind || "note",
        family_member_id: data.family_member_id || null,
        provider: data.provider || null,
        occurred_on: data.occurred_on || null,
        next_due_on: data.next_due_on || null,
        detail_enc: await encryptField(householdId, data.detail ?? null),
        policy_number_enc: await encryptField(householdId, data.policy_number ?? null),
      })
      .select("id, family_member_id, kind, title, provider, occurred_on, next_due_on, created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const revealMedicalRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
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
    if (!membership) throw new Error("No household");
    const householdId = membership.household_id as string;
    const { data: row, error } = await supabase
      .from("medical_records")
      .select("id, household_id, detail_enc, policy_number_enc")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    const { decryptField } = await import("./field-crypto.server");
    return {
      id: row.id,
      detail: await decryptField(householdId, row.detail_enc),
      policy_number: await decryptField(householdId, row.policy_number_enc),
    };
  });

export const deleteMedicalRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("medical_records").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
