import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Coming soon | Family COO" },
      { name: "description", content: "History is coming soon to Family COO." },
      { property: "og:title", content: "History — Family COO" },
      { property: "og:description", content: "History is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="History" />
      <ComingSoon
        title="We're still building this."
        description="History will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
