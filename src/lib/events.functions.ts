import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listEvents = createServerFn({ method: "GET" })
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
    const to = new Date(from.getTime() + 14 * 24 * 3600 * 1000);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("household_id", householdId)
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) =>
    z
      .object({
        title: z.string().min(1).max(280),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime().optional().nullable(),
        location: z.string().max(200).optional(),
        category: z.string().max(60).optional(),
        notes: z.string().max(2000).optional(),
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
      .from("calendar_events")
      .insert({
        household_id: householdId,
        title: data.title,
        starts_at: data.starts_at,
        ends_at: data.ends_at ?? null,
        location: data.location ?? null,
        category: data.category ?? null,
        notes: data.notes ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("calendar_events").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
