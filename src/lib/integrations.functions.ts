import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Return the Google OAuth authorization URL for the current user. */
export const startGoogleCalendarConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { origin?: string }) => data)
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
    const household_id = membership.household_id as string;
    const { signState, buildAuthUrl } = await import("./google-oauth.server");
    const state = await signState({ user_id: userId, household_id });
    const url = buildAuthUrl(state, data.origin);
    return { url };
  });

export const listCalendarIntegrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("calendar_integrations")
      .select(
        "id, provider, provider_account_email, calendar_ids, last_synced_at, sync_status, last_error, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { items: data ?? [] };
  });

export const disconnectCalendarIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("calendar_integrations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const syncCalendarNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify ownership via RLS-scoped read first.
    const { data: row } = await supabase
      .from("calendar_integrations")
      .select("id")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) throw new Error("Not found");
    const { syncIntegration } = await import("./calendar-sync.server");
    return syncIntegration(supabase, data.id);
  });

/** Household inbound-email address for forwarding. Generated lazily. */
export const getHouseholdInbound = createServerFn({ method: "GET" })
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
    if (!membership) throw new Error("No household");
    const household_id = membership.household_id as string;
    let { data: h } = await supabase
      .from("households")
      .select("id, inbound_email")
      .eq("id", household_id)
      .maybeSingle();
    if (!h) throw new Error("No household");
    if (!h.inbound_email) {
      const shortId = household_id.replace(/-/g, "").slice(0, 10);
      const addr = `h-${shortId}@in.familycoo.app`;
      await supabase.from("households").update({ inbound_email: addr }).eq("id", household_id);
      h = { ...h, inbound_email: addr };
    }
    return { inbound_email: h.inbound_email };
  });
