import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — Coming soon | Family COO" },
      { name: "description", content: "Agents is coming soon to Family COO." },
      { property: "og:title", content: "Agents — Family COO" },
      { property: "og:description", content: "Agents is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Agents" />
      <ComingSoon
        title="We're still building this."
        description="Agents will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
