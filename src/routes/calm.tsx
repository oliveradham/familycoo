import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/calm")({
  head: () => ({
    meta: [
      { title: "Calm — Coming soon | Family COO" },
      { name: "description", content: "Calm is coming soon to Family COO." },
      { property: "og:title", content: "Calm — Family COO" },
      { property: "og:description", content: "Calm is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalmPage,
});

function CalmPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Calm" />
      <ComingSoon
        title="We're still building this."
        description="Calm will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
