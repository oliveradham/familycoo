import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getLatestWeeklyReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: hm } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!hm) return { review: null };
    const { data } = await supabase
      .from("weekly_reviews")
      .select("id, week_start, headline, summary, wins, upcoming, stats, generated_at")
      .eq("household_id", hm.household_id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { review: data ?? null };
  });
