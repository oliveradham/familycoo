import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { readiness } from "@/lib/family-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/readiness")({
  head: () => ({ meta: [{ title: "Travel Readiness — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Travel readiness"
        title={readiness.trip}
        subtitle="A real score based on what's still outstanding — not gamification."
      />

      <section className="px-6 mb-8">
        <Card>
          <div className="flex items-end justify-between">
            <p className="font-serif text-6xl italic leading-none">{readiness.score}<span className="text-2xl text-muted-foreground">%</span></p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Ready</p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary/70">
            <div className="h-full rounded-full bg-zinc-900" style={{ width: `${readiness.score}%` }} />
          </div>
        </Card>
      </section>

      <section className="px-6 mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Still needed</p>
        <div className="space-y-2">
          {readiness.todo.map((t, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-2xl border p-3 ${t.critical ? "border-amber-200 bg-amber-50/60" : "border-hairline bg-surface"}`}>
              <input type="checkbox" className="mt-1 size-4 accent-zinc-900" />
              <p className="flex-1 text-[14px]">{t.label}</p>
              {t.critical && <span className="text-[10px] uppercase tracking-widest text-amber-700">Critical</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Done</p>
        <Card>
          <ul className="space-y-2">
            {readiness.done.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
