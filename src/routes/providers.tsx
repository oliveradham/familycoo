import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { providerPortal } from "@/lib/family-data";

export const Route = createFileRoute("/providers")({
  head: () => ({ meta: [{ title: "Provider Portal — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Provider portal"
        title="The people who help — connected, safely."
        subtitle="Nannies, coaches, tutors, doctors — each with a role-based view. They only see what they need."
      />
      <section className="px-6 space-y-3 pb-8">
        {providerPortal.map((p) => (
          <Card key={p.role}>
            <p className="font-serif text-[17px] italic leading-tight">{p.role}</p>
            <div className="mt-3 rounded-2xl bg-secondary/40 p-3 text-[13px]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Can see</p>
              <p className="mt-1">{p.sees}</p>
            </div>
            <div className="mt-2 rounded-2xl border border-dashed border-hairline p-3 text-[13px]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cannot see</p>
              <p className="mt-1 text-foreground/80">{p.cannotSee}</p>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
