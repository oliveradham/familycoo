import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://familycoo.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/plans", changefreq: "monthly", priority: "0.9" },
          { path: "/marketplace", changefreq: "weekly", priority: "0.7" },
          { path: "/workflows", changefreq: "weekly", priority: "0.7" },
          { path: "/creators", changefreq: "monthly", priority: "0.6" },
          { path: "/concierge", changefreq: "monthly", priority: "0.6" },
          { path: "/agents", changefreq: "weekly", priority: "0.7" },
          { path: "/approvals", changefreq: "weekly", priority: "0.7" },
          { path: "/autopilot", changefreq: "weekly", priority: "0.7" },
          { path: "/bookings", changefreq: "weekly", priority: "0.6" },
          { path: "/calendar", changefreq: "weekly", priority: "0.8" },
          { path: "/calm", changefreq: "monthly", priority: "0.5" },
          { path: "/checklists", changefreq: "weekly", priority: "0.6" },
          { path: "/comms", changefreq: "weekly", priority: "0.5" },
          { path: "/compare", changefreq: "monthly", priority: "0.5" },
          { path: "/conflicts", changefreq: "weekly", priority: "0.5" },
          { path: "/decisions", changefreq: "monthly", priority: "0.5" },
          { path: "/departure", changefreq: "monthly", priority: "0.5" },
          { path: "/developers", changefreq: "monthly", priority: "0.5" },
          { path: "/emergency", changefreq: "monthly", priority: "0.6" },
          { path: "/expenses", changefreq: "weekly", priority: "0.6" },
          { path: "/family", changefreq: "monthly", priority: "0.6" },
          { path: "/followups", changefreq: "weekly", priority: "0.5" },
          { path: "/gifts", changefreq: "monthly", priority: "0.5" },
          { path: "/groceries", changefreq: "weekly", priority: "0.6" },
          { path: "/handoff", changefreq: "monthly", priority: "0.5" },
          { path: "/health-prep", changefreq: "monthly", priority: "0.5" },
          { path: "/history", changefreq: "monthly", priority: "0.4" },
          { path: "/inbox", changefreq: "daily", priority: "0.8" },
          { path: "/integrations", changefreq: "monthly", priority: "0.6" },
          { path: "/maintenance", changefreq: "monthly", priority: "0.5" },
          { path: "/medical", changefreq: "monthly", priority: "0.6" },
          { path: "/predictions", changefreq: "weekly", priority: "0.5" },
          { path: "/privacy", changefreq: "monthly", priority: "0.4" },
          { path: "/providers", changefreq: "monthly", priority: "0.5" },
          { path: "/purchases", changefreq: "weekly", priority: "0.5" },
          { path: "/readiness", changefreq: "weekly", priority: "0.5" },
          { path: "/responsibilities", changefreq: "monthly", priority: "0.5" },
          { path: "/returns", changefreq: "monthly", priority: "0.5" },
          { path: "/review", changefreq: "weekly", priority: "0.6" },
          { path: "/rules", changefreq: "monthly", priority: "0.4" },
          { path: "/scenarios", changefreq: "monthly", priority: "0.5" },
          { path: "/school", changefreq: "weekly", priority: "0.6" },
          { path: "/search", changefreq: "monthly", priority: "0.4" },
          { path: "/security", changefreq: "monthly", priority: "0.4" },
          { path: "/settings", changefreq: "monthly", priority: "0.4" },
          { path: "/sports", changefreq: "weekly", priority: "0.6" },
          { path: "/subscriptions", changefreq: "monthly", priority: "0.5" },
          { path: "/tasks", changefreq: "daily", priority: "0.7" },
          { path: "/travel", changefreq: "weekly", priority: "0.6" },
          { path: "/twin", changefreq: "monthly", priority: "0.5" },
          { path: "/vault", changefreq: "monthly", priority: "0.5" },
          { path: "/waiting", changefreq: "weekly", priority: "0.5" },
          { path: "/onboarding", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/refund-policy", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
