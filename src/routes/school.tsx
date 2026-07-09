import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import { schoolEmails } from "@/lib/family-data";

export const Route = createFileRoute("/school")({
  head: () => ({ meta: [{ title: "School Hub — Family COO" }] }),
  component: SchoolPage,
});

function SchoolPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="School hub"
        title="School, translated."
        subtitle="Long emails become short action lists. Tuition, spirit weeks, permission slips — all tracked."
      />

      <section className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tuition</p>
            <p className="mt-2 font-serif text-2xl italic">$2,400</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Due Fri</p>
          </Card>
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Homework</p>
            <p className="mt-2 font-serif text-2xl italic">2</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">This week</p>
          </Card>
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Events</p>
            <p className="mt-2 font-serif text-2xl italic">4</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Oct</p>
          </Card>
        </div>
      </section>

      <section className="px-6">
        <SectionLabel>Email summaries</SectionLabel>
        <div className="space-y-3">
          {schoolEmails.map((e) => (
            <Card key={e.id}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {e.from}
                  </p>
                  <p className="mt-0.5 font-serif text-lg italic leading-tight">{e.subject}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{e.time}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{e.summary}</p>
              <div className="mt-4 space-y-1.5">
                {e.actions.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-[13px]"
                  >
                    <span className="size-1 rounded-full bg-foreground" />
                    {a}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
