import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listSportTeams = createServerFn({ method: "GET" })
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
      .from("sport_teams")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createSportTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        sport: z.string().min(1).max(80),
        team_name: z.string().max(120).optional(),
        season: z.string().max(60).optional(),
        ranking: z.string().max(60).optional(),
        coach_contact: z.string().max(200).optional(),
        kid_id: z.string().uuid().optional().nullable(),
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
      .from("sport_teams")
      .insert({
        household_id: householdId,
        sport: data.sport,
        team_name: data.team_name ?? null,
        season: data.season ?? null,
        ranking: data.ranking ?? null,
        coach_contact: data.coach_contact ?? null,
        kid_id: data.kid_id ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteSportTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sport_teams").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listSportEvents = createServerFn({ method: "GET" })
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
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 30 * 24 * 3600 * 1000);
    const { data, error } = await supabase
      .from("sport_events")
      .select("*")
      .eq("household_id", householdId)
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const createSportEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        team_id: z.string().uuid(),
        kind: z.enum(["practice", "game", "tournament", "other"]),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime().optional().nullable(),
        location: z.string().max(200).optional(),
        weather_note: z.string().max(200).optional(),
        equipment_note: z.string().max(200).optional(),
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
      .from("sport_events")
      .insert({
        household_id: householdId,
        team_id: data.team_id,
        kind: data.kind,
        starts_at: data.starts_at,
        ends_at: data.ends_at ?? null,
        location: data.location ?? null,
        weather_note: data.weather_note ?? null,
        equipment_note: data.equipment_note ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteSportEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sport_events").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
