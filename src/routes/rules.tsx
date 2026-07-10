import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { rules } from "@/lib/family-data";
import { useState } from "react";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Household Rules — Family COO" }] }),
  component: Page,
});

function Page() {
  const [items, setItems] = useState(rules);
  const [draft, setDraft] = useState("");

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family rules engine"
        title="Say it in plain language."
        subtitle="No code, no toggles buried in menus. Tell me how your household prefers to run, and I'll honor it."
      />

      <section className="px-6 mb-6">
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Add a rule</p>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Never book flights before 8 AM."
            className="mt-2 w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-[14px] outline-none"
          />
          <button
            onClick={() => {
              if (!draft.trim()) return;
              setItems([{ id: `r${items.length + 1}`, text: draft.trim(), on: true }, ...items]);
              setDraft("");
            }}
            className="mt-3 rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white"
          >
            Save rule
          </button>
        </Card>
      </section>

      <section className="px-6 space-y-2 pb-8">
        {items.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3"
          >
            <p className="flex-1 text-[14px] leading-snug">{r.text}</p>
            <button
              onClick={() =>
                setItems(items.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))
              }
              className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                r.on ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            >
              <span
                className={`size-5 rounded-full bg-white shadow transition-transform ${
                  r.on ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
