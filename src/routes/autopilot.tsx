import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { autopilotRules, autopilotLog } from "@/lib/family-data";
import { PremiumRoute } from "@/components/PremiumRoute";

export const Route = createFileRoute("/autopilot")({
  head: () => ({ meta: [{ title: "Autopilot — Family COO" }] }),
  component: Page,
});

function Page() {
  const [rules, setRules] = useState(autopilotRules);
  return (
    <PremiumRoute min="pro" feature="Autopilot">
    <AppShell>
      <PageHeader
        back
        eyebrow="Family Logistics Autopilot"
        title="Handle the routine, quietly."
        subtitle="Every automated action is visible and reversible. You approve what Family COO is allowed to do on your behalf."
      />
      <section className="px-6 mb-8">
        <SectionLabel>Rules</SectionLabel>
        <div className="space-y-2">
          {rules.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-[15px] font-medium leading-snug">{r.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{r.detail}</p>
                </div>
                <button
                  onClick={() =>
                    setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))
                  }
                  className={`h-7 w-12 rounded-full transition-colors ${r.enabled ? "bg-emerald-600" : "bg-zinc-200"}`}
                  aria-label="Toggle"
                >
                  <span
                    className={`block size-5 rounded-full bg-white shadow transition-transform ${
                      r.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Recent actions</SectionLabel>
        <Card>
          <ul className="space-y-3">
            {autopilotLog.map((l) => (
              <li key={l.id} className="flex items-start gap-3">
                <span className="mt-2 size-1.5 rounded-full bg-emerald-500" />
                <div className="flex-1">
                  <p className="text-[14px] leading-snug">{l.text}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">{l.when}</p>
                </div>
                <button className="text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4">
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </AppShell>
      </PremiumRoute>
  );
}
