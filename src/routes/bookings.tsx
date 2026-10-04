import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Coming soon | Family COO" },
      { name: "description", content: "Bookings is coming soon to Family COO." },
      { property: "og:title", content: "Bookings — Family COO" },
      { property: "og:description", content: "Bookings is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Bookings" />
      <ComingSoon
        title="We're still building this."
        description="Bookings will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
