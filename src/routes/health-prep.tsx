import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/health-prep")({
  head: () => ({
    meta: [
      { title: "Health Prep — Coming soon | Family COO" },
      { name: "description", content: "Health Prep is coming soon to Family COO." },
      { property: "og:title", content: "Health Prep — Family COO" },
      { property: "og:description", content: "Health Prep is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HealthPrepPage,
});

function HealthPrepPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Health Prep" />
      <ComingSoon
        title="We're still building this."
        description="Health Prep will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
