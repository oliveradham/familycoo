import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/autopilot")({
  head: () => ({
    meta: [
      { title: "Autopilot — Coming soon | Family COO" },
      { name: "description", content: "Autopilot is coming soon to Family COO." },
      { property: "og:title", content: "Autopilot — Family COO" },
      { property: "og:description", content: "Autopilot is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AutopilotPage,
});

function AutopilotPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Autopilot" />
      <ComingSoon
        title="We're still building this."
        description="Autopilot will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
