import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFamilyMembers = createServerFn({ method: "GET" })
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
      .from("family_members")
      .select("id, name, role, birth_date, color, notes, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const createFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; role: string; birth_date?: string | null; color?: string | null; notes?: string | null }) => {
    if (!input?.name?.trim()) throw new Error("Name required");
    if (!input?.role?.trim()) throw new Error("Role required");
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
      .from("family_members")
      .insert({
        household_id: householdId,
        name: data.name.trim(),
        role: data.role.trim(),
        birth_date: data.birth_date || null,
        color: data.color || null,
        notes: data.notes || null,
      })
      .select("id, name, role, birth_date, color, notes, created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const updateFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; name?: string; role?: string; birth_date?: string | null; color?: string | null; notes?: string | null }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: {
      name?: string;
      role?: string;
      birth_date?: string | null;
      color?: string | null;
      notes?: string | null;
    } = {};
    if (data.name !== undefined) patch.name = data.name.trim();
    if (data.role !== undefined) patch.role = data.role.trim();
    if (data.birth_date !== undefined) patch.birth_date = data.birth_date || null;
    if (data.color !== undefined) patch.color = data.color || null;
    if (data.notes !== undefined) patch.notes = data.notes || null;
    const { data: row, error } = await supabase
      .from("family_members")
      .update(patch)
      .eq("id", data.id)
      .select("id, name, role, birth_date, color, notes, created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const deleteFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("family_members").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
