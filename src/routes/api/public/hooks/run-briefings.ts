import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint — should be called every 10-15 minutes by pg_cron.
 *
 * For every household member whose profile lists a briefing time that matches
 * "right now" in their timezone, generate that briefing and upsert into
 * `briefings`. Idempotent within the day (unique on household_id+kind+date).
 */
export const Route = createFileRoute("/api/public/hooks/run-briefings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyCronRequest } = await import("@/lib/cron-auth.server");
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { generateBriefingContent, isTimeDue } = await import("@/lib/briefings.server");

        const now = new Date();
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select(
            "id, timezone, morning_briefing_at, afternoon_check_in_at, evening_wrap_at, autopilot_paused",
          );

        type BriefingKind = "morning" | "afternoon" | "evening";
        const results: { user: string; kind: BriefingKind }[] = [];

        for (const p of profiles ?? []) {
          if (p.autopilot_paused) continue;
          const tz = p.timezone ?? "UTC";
          const due: BriefingKind[] = [];
          if (isTimeDue(now, p.morning_briefing_at, tz)) due.push("morning");
          if (isTimeDue(now, p.afternoon_check_in_at, tz)) due.push("afternoon");
          if (isTimeDue(now, p.evening_wrap_at, tz)) due.push("evening");
          if (due.length === 0) continue;

          const { data: hm } = await supabaseAdmin
            .from("household_members")
            .select("household_id")
            .eq("user_id", p.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          if (!hm) continue;
          const householdId = hm.household_id as string;

          const in48h = new Date(now.getTime() + 48 * 3600_000).toISOString();
          const [{ data: events }, { data: tasks }, { data: members }] = await Promise.all([
            supabaseAdmin
              .from("calendar_events")
              .select("title, starts_at, location, category")
              .eq("household_id", householdId)
              .gte("starts_at", now.toISOString())
              .lte("starts_at", in48h)
              .order("starts_at", { ascending: true })
              .limit(20),
            supabaseAdmin
              .from("tasks")
              .select("title, due_at, priority, status, category")
              .eq("household_id", householdId)
              .eq("status", "open")
              .order("due_at", { ascending: true, nullsFirst: false })
              .limit(20),
            supabaseAdmin
              .from("family_members")
              .select("name, role")
              .eq("household_id", householdId)
              .limit(20),
          ]);

          const grounding = {
            today: now.toISOString(),
            timezone: tz,
            family: members ?? [],
            events: events ?? [],
            open_tasks: tasks ?? [],
          };

          for (const kind of due) {
            try {
              const content = await generateBriefingContent(kind, grounding);
              const today = new Date().toISOString().slice(0, 10);
              await supabaseAdmin.from("briefings").upsert(
                {
                  household_id: householdId,
                  kind,
                  briefing_date: today,
                  content: content as unknown as never,
                  generated_at: new Date().toISOString(),
                },
                { onConflict: "household_id,kind,briefing_date" },
              );
              const { notifyHousehold } = await import("@/lib/notify.server");
              await notifyHousehold(supabaseAdmin, {
                household_id: householdId,
                kind: `briefing:${kind}`,
                subject: content.headline,
                body: content.summary,
                url: "/",
                ref_id: `briefing:${kind}:${today}`,
                user_ids: [p.id],
                dedupe_hours: 20,
              });
              results.push({ user: p.id, kind });
            } catch (e) {
              await supabaseAdmin.from("notification_log").insert({
                user_id: p.id,
                household_id: householdId,
                channel: "in_app",
                kind: `briefing:${kind}`,
                error: e instanceof Error ? e.message : String(e),
              });
            }
          }
        }

        return Response.json({ ok: true, generated: results.length, details: results });
      },
    },
  },
});
