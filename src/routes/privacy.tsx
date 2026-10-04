import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ComingSoon } from "@/components/EmptyState";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Coming soon | Family COO" },
      { name: "description", content: "Privacy is coming soon to Family COO." },
      { property: "og:title", content: "Privacy — Family COO" },
      { property: "og:description", content: "Privacy is coming soon to Family COO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <PageHeader back eyebrow="Coming soon" title="Privacy" />
      <ComingSoon
        title="We're still building this."
        description="Privacy will work from your own family's data once it's ready. Nothing here yet."
      />
    </AppShell>
  );
}
