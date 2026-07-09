import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { documents } from "@/lib/family-data";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Document Vault — Family COO" }] }),
  component: VaultPage,
});

function VaultPage() {
  const [q, setQ] = useState("");
  const filtered = documents.filter(
    (d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.tag.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Document vault"
        title="Everything findable."
        subtitle={`Passports, contracts, records — try "Find Oliver's passport" or "insurance".`}
      />

      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 rounded-full border border-hairline bg-surface px-4 py-3">
          <Search className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask the vault…"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
      </div>

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {filtered.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.detail}</p>
                </div>
                <span className="rounded-full border border-hairline px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {d.tag}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">Nothing matched.</li>
            )}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
