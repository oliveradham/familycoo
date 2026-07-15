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