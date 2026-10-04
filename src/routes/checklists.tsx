import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Checklists — Coming soon | Family COO" },
      { name: "description", content: "Checklists is coming soon to Family COO." },
      { property: "og:title", content: "Checklists — Family COO" },
      { property: "og:description", content: "Checklists is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Checklists" />
      <ComingSoon
        title="We're still building this."
        description="Checklists will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
