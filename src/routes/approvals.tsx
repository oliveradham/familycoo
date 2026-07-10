import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { approvals } from "@/lib/family-data";
import { Check, Info, Pencil } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Ready for your approval"
        title="Here's exactly what will happen."
        subtitle="Nothing sensitive goes out without your yes. Every action is reversible."
      />
      <section className="px-6 space-y-3 pb-8">
        {approvals.map((a) => (
          <ApprovalCard key={a.id} a={a} />
        ))}
      </section>
    </AppShell>
  );
}

function ApprovalCard({ a }: { a: (typeof approvals)[number] }) {
  const [state, setState] = useState<"pending" | "approved" | "later">("pending");
  const [showWhy, setShowWhy] = useState(false);

  return (
    <Card
      className={
        state === "approved"
          ? "bg-emerald-50/60 border-emerald-200"
          : state === "later"
            ? "opacity-60"
            : ""
      }
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Family COO will
      </p>
      <p className="mt-1 font-serif text-[19px] italic leading-tight">{a.title}</p>

      <ol className="mt-3 divide-y divide-hairline rounded-2xl bg-secondary/40 px-3">
        {a.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 py-2.5 text-[13px]">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-hairline text-[10px]">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={() => setShowWhy((s) => !s)}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground underline underline-offset-4"
      >
        <Info className="size-3" /> Why?
      </button>
      {showWhy && (
        <p className="mt-2 rounded-xl border border-dashed border-hairline p-3 text-[12px] leading-relaxed text-muted-foreground">
          {a.why} · Reversible: {a.reversible ? "yes" : "no"}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setState("approved")}
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-white"
        >
          <Check className="size-3" strokeWidth={2.5} />
          {state === "approved" ? "Approved" : "Approve"}
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-2 text-[11px] uppercase tracking-widest">
          <Pencil className="size-3" /> Edit
        </button>
        <button
          onClick={() => setState("later")}
          className="ml-auto text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4"
        >
          Not now
        </button>
      </div>
    </Card>
  );
}
