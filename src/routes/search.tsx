import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Coming soon | Family COO" },
      { name: "description", content: "Search is coming soon to Family COO." },
      { property: "og:title", content: "Search — Family COO" },
      { property: "og:description", content: "Search is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Search" />
      <ComingSoon
        title="We're still building this."
        description="Search will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
