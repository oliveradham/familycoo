import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/decisions")({
  head: () => ({
    meta: [
      { title: "Decisions — Coming soon | Family COO" },
      { name: "description", content: "Decisions is coming soon to Family COO." },
      { property: "og:title", content: "Decisions — Family COO" },
      { property: "og:description", content: "Decisions is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DecisionsPage,
});

function DecisionsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Decisions" />
      <ComingSoon
        title="We're still building this."
        description="Decisions will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
