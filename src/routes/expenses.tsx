import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listExpenses, createExpense, deleteExpense } from "@/lib/expenses.functions";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Family COO" }] }),
  component: ExpensesPage,
});

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function ExpensesPage() {
  const list = useServerFn(listExpenses);
  const create = useServerFn(createExpense);
  const del = useServerFn(deleteExpense);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => list(),
    enabled: !authLoading && Boolean(session),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "groceries", merchant: "", spent_on: new Date().toISOString().slice(0, 10) });

  const mCreate = useMutation({
    mutationFn: () =>
      create({
        data: {
          amount_cents: Math.round(parseFloat(form.amount || "0") * 100),
          category: form.category,
          merchant: form.merchant,
          spent_on: form.spent_on,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      setForm({ amount: "", category: "groceries", merchant: "", spent_on: new Date().toISOString().slice(0, 10) });
    },
  });
  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const totals: Record<string, number> = {};
  const thisMonth = new Date().toISOString().slice(0, 7);
  data.forEach((e: any) => {
    if ((e.spent_on || "").startsWith(thisMonth)) {
      totals[e.category] = (totals[e.category] || 0) + e.amount_cents;
    }
  });
  const monthTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <AppShell>
      <PageHeader back eyebrow="Money" title="Smart expenses." subtitle="Track spending by category, catch subscriptions, keep receipts." />

      <section className="px-6 mb-4">
        <Card>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">This month</p>
          <p className="mt-1 text-2xl font-medium">{fmt(monthTotal, "USD")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(totals).map(([k, v]) => (
              <li key={k} className="flex justify-between rounded-md bg-secondary/60 px-2 py-1">
                <span className="capitalize text-muted-foreground">{k}</span>
                <span>{fmt(v, "USD")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-6 mb-4">
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Plus className="size-3.5" strokeWidth={1.75} /> Log expense
        </button>
      </section>

      {open && (
        <section className="px-6 mb-4">
          <Card>
            <div className="grid gap-3">
              <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm">
                  <option>groceries</option>
                  <option>dining</option>
                  <option>transport</option>
                  <option>utilities</option>
                  <option>childcare</option>
                  <option>subscriptions</option>
                  <option>medical</option>
                  <option>other</option>
                </select>
                <input type="date" value={form.spent_on} onChange={(e) => setForm({ ...form, spent_on: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm" />
              </div>
              <input placeholder="Merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" />
              <button onClick={() => mCreate.mutate()} disabled={!form.amount || mCreate.isPending} className="rounded-full bg-zinc-900 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50">
                {mCreate.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </Card>
        </section>
      )}

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {data.map((e: any) => (
              <li key={e.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{e.merchant || e.category}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.category} · {e.spent_on}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{fmt(e.amount_cents, e.currency)}</span>
                  <button onClick={() => mDel.mutate(e.id)} className="text-muted-foreground hover:text-foreground" aria-label="Delete">
                    <Trash2 className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
            {data.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No expenses yet.</li>}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
