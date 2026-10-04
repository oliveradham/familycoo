import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns — Coming soon | Family COO" },
      { name: "description", content: "Returns is coming soon to Family COO." },
      { property: "og:title", content: "Returns — Family COO" },
      { property: "og:description", content: "Returns is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Returns" />
      <ComingSoon
        title="We're still building this."
        description="Returns will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
