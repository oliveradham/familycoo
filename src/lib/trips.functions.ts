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

export const listTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const householdId = await resolveHousehold(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("trips")
      .select("id, title, destination, start_date, end_date, travelers, status, notes, created_at")
      .eq("household_id", householdId)
      .order("start_date", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  });

export const createTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; destination?: string | null; start_date?: string | null; end_date?: string | null; travelers?: string[]; status?: string; notes?: string | null }) => {
    if (!input?.title?.trim()) throw new Error("title required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const householdId = await resolveHousehold(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("trips")
      .insert({
        household_id: householdId,
        title: data.title.trim(),
        destination: data.destination || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        travelers: data.travelers ?? [],
        status: data.status || "planning",
        notes: data.notes || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const updateTripStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => {
    if (!input?.id || !input?.status) throw new Error("id + status required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("trips").update({ status: data.status }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("trips").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
