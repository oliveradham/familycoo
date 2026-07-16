import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select(
        "timezone, autopilot_paused, morning_briefing_at, afternoon_check_in_at, evening_wrap_at, notification_channel",
      )
      .eq("id", userId)
      .maybeSingle();
    return data ?? null;
  });

export const savePrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      timezone?: string;
      autopilot_paused?: boolean;
      morning_briefing_at?: string | null;
      afternoon_check_in_at?: string | null;
      evening_wrap_at?: string | null;
      notification_channel?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });
