import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "Purchases — Coming soon | Family COO" },
      { name: "description", content: "Purchases is coming soon to Family COO." },
      { property: "og:title", content: "Purchases — Family COO" },
      { property: "og:description", content: "Purchases is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Purchases" />
      <ComingSoon
        title="We're still building this."
        description="Purchases will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
