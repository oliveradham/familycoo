import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/handoff")({
  head: () => ({
    meta: [
      { title: "Handoff — Coming soon | Family COO" },
      { name: "description", content: "Handoff is coming soon to Family COO." },
      { property: "og:title", content: "Handoff — Family COO" },
      { property: "og:description", content: "Handoff is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HandoffPage,
});

function HandoffPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Handoff" />
      <ComingSoon
        title="We're still building this."
        description="Handoff will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
