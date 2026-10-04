import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creators — Coming soon | Family COO" },
      { name: "description", content: "Creators is coming soon to Family COO." },
      { property: "og:title", content: "Creators — Family COO" },
      { property: "og:description", content: "Creators is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreatorsPage,
});

function CreatorsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Creators" />
      <ComingSoon
        title="We're still building this."
        description="Creators will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
