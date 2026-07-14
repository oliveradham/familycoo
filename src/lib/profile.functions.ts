import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, timezone")
      .eq("id", userId)
      .maybeSingle();
    return data ?? { id: userId, display_name: null, avatar_url: null, timezone: null };
  });
