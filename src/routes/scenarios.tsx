import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios — Coming soon | Family COO" },
      { name: "description", content: "Scenarios is coming soon to Family COO." },
      { property: "og:title", content: "Scenarios — Family COO" },
      { property: "og:description", content: "Scenarios is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Scenarios" />
      <ComingSoon
        title="We're still building this."
        description="Scenarios will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
