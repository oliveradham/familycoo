import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the current user's primary household (first membership).
 * Every authenticated user has one via the handle_new_user trigger.
 */
export const getMyHousehold = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: membership, error: mErr } = await supabase
      .from("household_members")
      .select("household_id, member_role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (mErr) throw mErr;
    if (!membership) return null;

    const { data: household, error: hErr } = await supabase
      .from("households")
      .select("id, name, city")
      .eq("id", membership.household_id)
      .maybeSingle();
    if (hErr) throw hErr;

    return household;
  });
