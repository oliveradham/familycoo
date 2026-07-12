import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { creators, creatorProgram } from "@/lib/family-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creator Program — Sell Family Expertise | Family COO" },
      {
        name: "description",
        content:
          "For organizers, coaches, dietitians, teachers, and parents. Publish templates and workflows on Family COO with a 70/30 revenue share and monthly payouts.",
      },
      { property: "og:title", content: "Family COO Creator Program" },
      {
        property: "og:description",
        content: "Turn what you know about family life into templates and workflows other households can install.",
      },
      { property: "og:url", content: "https://family-coo.com/creators" },
    ],
    links: [{ rel: "canonical", href: "https://family-coo.com/creators" }],
  }),
  component: Page,
});

const statusColor: Record<string, string> = {
  Featured: "bg-zinc-900 text-white",
  Approved: "border border-hairline text-foreground/80",
  "In review": "border border-amber-300 text-amber-800 bg-amber-50",
};

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Creator Program"
        title="Sell what you know about family life."
        subtitle="For organizers, coaches, dietitians, teachers, and parents who've built something real."
      />

      <section className="px-6 mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-hairline bg-surface p-3 text-center">
        <Stat label="Revenue share" value="70/30" />
        <Stat label="Review" value="Every item" />
        <Stat label="Payout" value="Monthly" />
      </section>

      <SectionLabel>What creators get</SectionLabel>
      <section className="px-6 mb-6">
        <Card>
          <ul className="space-y-2">
            {creatorProgram.perks.map((p, k) => (
              <li key={k} className="flex items-start gap-2.5 text-[14px] leading-snug">
                <Check className="mt-1 size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <SectionLabel>What we look for</SectionLabel>
      <section className="px-6 mb-6">
        <Card>
          <ul className="space-y-2">
            {creatorProgram.requirements.map((r, k) => (
              <li key={k} className="flex items-start gap-2.5 text-[14px] leading-snug">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
            {creatorProgram.review}
          </p>
        </Card>
      </section>

      <SectionLabel>Featured creators</SectionLabel>
      <section className="px-6 space-y-2 pb-6">
        {creators.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.discipline}
                </p>
                <p className="mt-1 font-serif text-[17px] italic leading-tight">{c.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/80">{c.bio}</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.works} items published
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] uppercase tracking-widest ${statusColor[c.status]}`}
              >
                {c.status}
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="px-6 pb-10">
        <button className="w-full rounded-full bg-zinc-900 px-4 py-3.5 text-[12px] font-medium uppercase tracking-widest text-white">
          Apply to become a creator
        </button>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="font-serif text-xl italic leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
