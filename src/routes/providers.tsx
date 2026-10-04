import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "Providers — Coming soon | Family COO" },
      { name: "description", content: "Providers is coming soon to Family COO." },
      { property: "og:title", content: "Providers — Family COO" },
      { property: "og:description", content: "Providers is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProvidersPage,
});

function ProvidersPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Providers" />
      <ComingSoon
        title="We're still building this."
        description="Providers will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
