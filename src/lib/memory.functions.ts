import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemoryCategory = "preference" | "allergy" | "routine" | "contact" | "logistics" | "other";

export const listMemories = createServerFn({ method: "GET" })
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
    if (membershipError) throw new Error(membershipError.message);
    if (!membership) return [];
    const hh = membership.household_id as string;
    const { data, error } = await supabase
      .from("family_memory")
      .select("id, category, fact, subject_id, source, confidence, expires_at, created_at")
      .eq("household_id", hh)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { fact: string; category?: MemoryCategory; subject_id?: string | null }) => {
    if (!input?.fact || input.fact.trim().length < 2) throw new Error("fact required");
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
    if (membershipError) throw new Error(membershipError.message);
    if (!membership) throw new Error("No household");
    const hh = membership.household_id as string;
    const { data: row, error } = await supabase
      .from("family_memory")
      .insert({
        household_id: hh,
        fact: data.fact.trim().slice(0, 500),
        category: data.category ?? "other",
        subject_id: data.subject_id ?? null,
        source: "user",
        created_by: userId,
      })
      .select("id, category, fact, subject_id, source, confidence, expires_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("family_memory").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
