import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/followups")({
  head: () => ({
    meta: [
      { title: "Followups — Coming soon | Family COO" },
      { name: "description", content: "Followups is coming soon to Family COO." },
      { property: "og:title", content: "Followups — Family COO" },
      { property: "og:description", content: "Followups is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FollowupsPage,
});

function FollowupsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Followups" />
      <ComingSoon
        title="We're still building this."
        description="Followups will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
