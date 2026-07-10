import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemoryCategory = "preference" | "allergy" | "routine" | "contact" | "logistics" | "other";

async function householdIdFor(supabase: any, userId: string): Promise<string> {
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

export const listMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const hh = await householdIdFor(supabase, userId);
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
  .inputValidator((input: { fact: string; category?: MemoryCategory; subject_id?: string | null }) => {
    if (!input?.fact || input.fact.trim().length < 2) throw new Error("fact required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const hh = await householdIdFor(supabase, userId);
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
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("family_memory").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Recall memories whose fact text overlaps the query — cheap keyword match. */
export async function recallMemories(supabase: any, householdId: string, query: string, limit = 12) {
  const { data } = await supabase
    .from("family_memory")
    .select("category, fact, subject_id, confidence")
    .eq("household_id", householdId)
    .not("category", "in", "(medical,financial)")
    .order("created_at", { ascending: false })
    .limit(80);
  if (!data) return [];
  const q = (query || "").toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 3);
  const scored = data.map((m: any) => {
    const f = (m.fact ?? "").toLowerCase();
    const hits = tokens.filter((t) => f.includes(t)).length;
    return { m, score: hits };
  });
  scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  return scored.slice(0, limit).map((s: { m: unknown }) => s.m);
}
