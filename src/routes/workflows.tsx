import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows — Coming soon | Family COO" },
      { name: "description", content: "Workflows is coming soon to Family COO." },
      { property: "og:title", content: "Workflows — Family COO" },
      { property: "og:description", content: "Workflows is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Workflows" />
      <ComingSoon
        title="We're still building this."
        description="Workflows will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
