import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { inbox, family, type InboxItem } from "@/lib/family-data";
import { useState } from "react";
import { Check, HelpCircle, Info } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Inbox Intelligence — Family COO" }] }),
  component: InboxPage,
});

function InboxPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Email intelligence"
        title="What I learned."
        subtitle="From 90 days of Gmail. Each item shows who it belongs to, why, and what to do."
      />

      <section className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-hairline bg-surface p-2 text-center">
          <Stat n="1,240" l="Emails scanned" />
          <Stat n="47" l="Auto-classified" />
          <Stat n="6" l="Need review" />
        </div>
      </section>

      <section className="px-6">
        <SectionLabel>Classified messages</SectionLabel>
        <div className="space-y-2">
          {inbox.map((m) => (
            <InboxCard key={m.id} m={m} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="py-2">
      <p className="font-serif text-2xl italic leading-none">{n}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
    </div>
  );
}

function InboxCard({ m }: { m: InboxItem }) {
  const [assignee, setAssignee] = useState(m.assigned);
  const [showWhy, setShowWhy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const p = family.find((f) => f.id === assignee);
  const low = m.confidence < 0.8;

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {m.from} · {m.time}
          </p>
          <p className="mt-0.5 font-serif text-lg italic leading-tight">{m.subject}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">{m.preview}</p>
        </div>
        <span className="rounded-full border border-hairline px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {m.category}
        </span>
      </div>

      {m.extracted && (
        <div className="mb-3 divide-y divide-hairline rounded-2xl bg-secondary/40 px-3">
          {m.extracted.map((x) => (
            <div key={x.label} className="flex items-baseline justify-between gap-4 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {x.label}
              </p>
              <p className="text-[13px] text-right">{x.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Belongs to
        </span>
        <div className="flex gap-1">
          {family
            .filter((f) => f.role !== "nanny")
            .map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setAssignee(f.id);
                  setConfirmed(true);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] ${
                  assignee === f.id ? f.color : "border border-hairline text-muted-foreground"
                }`}
              >
                <span className="grid size-4 place-items-center rounded-full bg-black/10 text-[8px]">
                  {f.initials}
                </span>
                {f.name.split(" ")[0]}
              </button>
            ))}
        </div>
        <button
          onClick={() => setShowWhy((s) => !s)}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-4"
        >
          <HelpCircle className="size-3" /> Why?
        </button>
      </div>

      {showWhy && (
        <p className="mt-3 flex gap-2 rounded-xl border border-dashed border-hairline p-3 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {m.reason}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] ${
            low ? "text-amber-700" : "text-muted-foreground"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`}
          />
          {Math.round(m.confidence * 100)}% confidence
          {low && " · needs confirmation"}
          {confirmed && " · learned"}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setConfirmed(true)}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-widest text-white"
          >
            <Check className="size-3" strokeWidth={2.5} /> Confirm
            {p ? ` · ${p.name.split(" ")[0]}` : ""}
          </button>
          <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest">
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}
