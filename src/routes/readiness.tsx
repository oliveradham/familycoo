import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/readiness")({
  head: () => ({
    meta: [
      { title: "Readiness — Coming soon | Family COO" },
      { name: "description", content: "Readiness is coming soon to Family COO." },
      { property: "og:title", content: "Readiness — Family COO" },
      { property: "og:description", content: "Readiness is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReadinessPage,
});

function ReadinessPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Readiness" />
      <ComingSoon
        title="We're still building this."
        description="Readiness will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
