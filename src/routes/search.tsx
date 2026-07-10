import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { searchExamples } from "@/lib/family-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Family Search — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family search"
        title="Ask anything about your family."
        subtitle="I'll answer from what you've already shared — emails, receipts, documents, calendar — and show my source."
      />

      <section className="px-6 mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5">
          <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="flex-1 text-[13px] text-muted-foreground">
            Try: "When did Lily last see the dentist?"
          </span>
        </div>
      </section>

      <section className="px-6 space-y-3">
        {searchExamples.map((s, i) => (
          <Card key={i}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Question</p>
            <p className="mt-1 font-serif text-[17px] italic leading-snug">{s.q}</p>
            <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">Answer</p>
            <p className="mt-1 text-[14px] leading-relaxed">{s.a}</p>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
