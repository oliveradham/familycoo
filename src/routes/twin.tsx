import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/twin")({
  head: () => ({
    meta: [
      { title: "Twin — Coming soon | Family COO" },
      { name: "description", content: "Twin is coming soon to Family COO." },
      { property: "og:title", content: "Twin — Family COO" },
      { property: "og:description", content: "Twin is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TwinPage,
});

function TwinPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Twin" />
      <ComingSoon
        title="We're still building this."
        description="Twin will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
