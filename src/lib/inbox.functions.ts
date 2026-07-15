import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const LANES = [
  "needs_signature",
  "needs_payment",
  "needs_response",
  "needs_scheduling",
  "waiting",
  "upcoming_travel",
  "renewals",
  "fyi",
] as const;

export const listInbox = createServerFn({ method: "GET" })
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
      .from("inbox_items")
      .select("*")
      .eq("household_id", householdId)
      .order("status", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const createInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        subject: z.string().min(1).max(280),
        summary: z.string().max(2000).optional(),
        sender: z.string().max(200).optional(),
        lane: z.enum(LANES).default("fyi"),
        due_at: z.string().datetime().optional().nullable(),
        amount: z.number().optional().nullable(),
        source: z.string().max(60).default("manual"),
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
      .from("inbox_items")
      .insert({
        household_id: householdId,
        subject: data.subject,
        summary: data.summary ?? null,
        sender: data.sender ?? null,
        lane: data.lane,
        due_at: data.due_at ?? null,
        amount: data.amount ?? null,
        source: data.source,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const setInboxStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["open", "done", "snoozed"]),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("inbox_items")
      .update({ status: data.status })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    return row;
  });
