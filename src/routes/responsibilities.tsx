import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/responsibilities")({
  head: () => ({
    meta: [
      { title: "Responsibilities — Coming soon | Family COO" },
      { name: "description", content: "Responsibilities is coming soon to Family COO." },
      { property: "og:title", content: "Responsibilities — Family COO" },
      { property: "og:description", content: "Responsibilities is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResponsibilitiesPage,
});

function ResponsibilitiesPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Responsibilities" />
      <ComingSoon
        title="We're still building this."
        description="Responsibilities will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
