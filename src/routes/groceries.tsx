import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listGroceries, createGrocery, setGroceryStatus, deleteGrocery } from "@/lib/groceries.functions";
import { Plus, Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/groceries")({
  head: () => ({ meta: [{ title: "Groceries — Family COO" }] }),
  component: GroceriesPage,
});

function GroceriesPage() {
  const list = useServerFn(listGroceries);
  const create = useServerFn(createGrocery);
  const setStatus = useServerFn(setGroceryStatus);
  const del = useServerFn(deleteGrocery);
  const qc = useQueryClient();
  const { data } = useSuspenseQuery({ queryKey: ["groceries"], queryFn: () => list() });
  const [name, setName] = useState("");

  const mCreate = useMutation({
    mutationFn: () => create({ data: { name, status: "need" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groceries"] });
      setName("");
    },
  });
  const mStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => setStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groceries"] }),
  });
  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groceries"] }),
  });

  const need = data.filter((g: any) => g.status === "need");
  const pantry = data.filter((g: any) => g.status !== "need");

  return (
    <AppShell>
      <PageHeader back eyebrow="Kitchen" title="Groceries & pantry." subtitle="One tap to move between shopping list and pantry." />

      <section className="px-6 mb-4">
        <Card>
          <div className="flex items-center gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add item…" className="flex-1 rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none" onKeyDown={(e) => e.key === "Enter" && name.trim() && mCreate.mutate()} />
            <button onClick={() => name.trim() && mCreate.mutate()} className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-2 text-xs uppercase tracking-widest text-white">
              <Plus className="size-3.5" strokeWidth={1.75} /> Add
            </button>
          </div>
        </Card>
      </section>

      <section className="px-6 mb-6">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Shopping list · {need.length}</p>
        <Card>
          <ul className="divide-y divide-hairline">
            {need.map((g: any) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <button onClick={() => mStatus.mutate({ id: g.id, status: "pantry" })} className="flex items-center gap-3 flex-1 text-left">
                  <span className="size-4 rounded-full border border-hairline inline-flex items-center justify-center">
                    <Check className="size-3 text-muted-foreground opacity-0 hover:opacity-100" strokeWidth={2} />
                  </span>
                  <span className="text-sm">{g.name}</span>
                </button>
                <button onClick={() => mDel.mutate(g.id)} className="text-muted-foreground hover:text-foreground" aria-label="Delete">
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </li>
            ))}
            {need.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Nothing on the list.</li>}
          </ul>
        </Card>
      </section>

      <section className="px-6">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Pantry · {pantry.length}</p>
        <Card>
          <ul className="divide-y divide-hairline">
            {pantry.map((g: any) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <button onClick={() => mStatus.mutate({ id: g.id, status: "need" })} className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground">
                  {g.name}
                </button>
                <button onClick={() => mDel.mutate(g.id)} className="text-muted-foreground hover:text-foreground" aria-label="Delete">
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </li>
            ))}
            {pantry.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Pantry is empty.</li>}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
