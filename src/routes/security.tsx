import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { security } from "@/lib/family-data";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Family Security — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Quiet vigilance"
        title="I watch for the things that don't look right."
        subtitle="Fake school payment requests, unusual charges, phishing dressed as family — flagged without unnecessary alarm."
      />
      <section className="px-6 space-y-3 pb-8">
        {security.map((s) => (
          <Card
            key={s.id}
            className={s.severity === "warn" ? "border-amber-200 bg-amber-50/50" : ""}
          >
            <div className="flex items-start gap-3">
              {s.severity === "warn" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
              ) : (
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              )}
              <div>
                <p className="text-[14px] leading-snug">{s.text}</p>
                <p className="mt-2 text-[12px] text-muted-foreground">{s.advice}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
