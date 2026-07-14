import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint — call hourly. Runs every proactive agent across every
 * household that hasn't paused autopilot. Writes agent_runs rows and pushes
 * approval-ready items into inbox_items.
 */
export const Route = createFileRoute("/api/public/hooks/agents-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyCronRequest } = await import("@/lib/cron-auth.server");
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runAllAgents } = await import("@/lib/agents.server");

        // households with at least one non-paused owner
        const { data: households } = await supabaseAdmin.from("households").select("id");
        const results: Record<string, unknown> = {};
        for (const h of households ?? []) {
          const { data: members } = await supabaseAdmin
            .from("household_members")
            .select("user_id")
            .eq("household_id", h.id);
          const memberIds = (members ?? []).map((m) => m.user_id);
          if (memberIds.length === 0) continue;
          const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("autopilot_paused")
            .in("id", memberIds);
          const anyActive = (profiles ?? []).some((p) => !p.autopilot_paused);
          if (!anyActive) continue;
          results[h.id] = await runAllAgents(supabaseAdmin, h.id);
        }
        return Response.json({ ok: true, households: Object.keys(results).length, results });
      },
    },
  },
});
