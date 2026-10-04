import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Developers — Coming soon | Family COO" },
      { name: "description", content: "Developers is coming soon to Family COO." },
      { property: "og:title", content: "Developers — Family COO" },
      { property: "og:description", content: "Developers is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevelopersPage,
});

function DevelopersPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Developers" />
      <ComingSoon
        title="We're still building this."
        description="Developers will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
