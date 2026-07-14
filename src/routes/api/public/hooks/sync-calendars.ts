import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron — every 30 minutes. Refresh tokens as needed and pull the next 30 days
 * of events from every connected Google account into `calendar_events`.
 */
export const Route = createFileRoute("/api/public/hooks/sync-calendars")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyCronRequest } = await import("@/lib/cron-auth.server");
        const unauthorized = verifyCronRequest(request);
        if (unauthorized) return unauthorized;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { syncAllIntegrations } = await import("@/lib/calendar-sync.server");
        const results = await syncAllIntegrations(supabaseAdmin);
        return Response.json({ ok: true, ...results });
      },
    },
  },
});
