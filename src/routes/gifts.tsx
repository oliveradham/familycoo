import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Gifts — Coming soon | Family COO" },
      { name: "description", content: "Gifts is coming soon to Family COO." },
      { property: "og:title", content: "Gifts — Family COO" },
      { property: "og:description", content: "Gifts is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GiftsPage,
});

function GiftsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Gifts" />
      <ComingSoon
        title="We're still building this."
        description="Gifts will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
