import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint — run Sunday morning (e.g. 07:00 UTC).
 * Generates one weekly review per household for the current week.
 */
export const Route = createFileRoute("/api/public/hooks/run-weekly-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        const apiKey = request.headers.get("apikey");
        if (!anonKey || apiKey !== anonKey) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { generateWeeklyReview, currentWeekStartIso } = await import(
          "@/lib/weekly-review.server"
        );
        const { notifyHousehold } = await import("@/lib/notify.server");

        const week_start = currentWeekStartIso();
        const { data: households } = await supabaseAdmin.from("households").select("id");

        const results: { household_id: string; ok: boolean }[] = [];
        for (const h of households ?? []) {
          const householdId = h.id as string;
          try {
            const content = await generateWeeklyReview(supabaseAdmin, householdId);
            if (!content) {
              results.push({ household_id: householdId, ok: false });
              continue;
            }
            await supabaseAdmin.from("weekly_reviews").upsert(
              {
                household_id: householdId,
                week_start,
                headline: content.headline,
                summary: content.summary,
                wins: content.wins as unknown as never,
                upcoming: content.upcoming as unknown as never,
                stats: content.stats as unknown as never,
                generated_at: new Date().toISOString(),
              },
              { onConflict: "household_id,week_start" },
            );
            await notifyHousehold(supabaseAdmin, {
              household_id: householdId,
              kind: "weekly_review",
              subject: content.headline,
              body: content.summary,
              url: "/review",
              ref_id: `weekly_review:${week_start}`,
              dedupe_hours: 24 * 6,
            });
            results.push({ household_id: householdId, ok: true });
          } catch (e) {
            results.push({ household_id: householdId, ok: false });
            console.error("weekly review failed", householdId, e);
          }
        }

        return Response.json({ ok: true, generated: results.length, results });
      },
    },
  },
});
