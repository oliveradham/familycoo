import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — Coming soon | Family COO" },
      { name: "description", content: "Subscriptions is coming soon to Family COO." },
      { property: "og:title", content: "Subscriptions — Family COO" },
      { property: "og:description", content: "Subscriptions is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Subscriptions" />
      <ComingSoon
        title="We're still building this."
        description="Subscriptions will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
