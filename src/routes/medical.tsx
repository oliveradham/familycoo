import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  listMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
  revealMedicalRecord,
} from "@/lib/medical.functions";
import { Plus, Lock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/medical")({
  head: () => ({ meta: [{ title: "Medical Hub — Family COO" }] }),
  component: MedicalPage,
});

function MedicalPage() {
  const list = useServerFn(listMedicalRecords);
  const create = useServerFn(createMedicalRecord);
  const del = useServerFn(deleteMedicalRecord);
  const reveal = useServerFn(revealMedicalRecord);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["medical"],
    queryFn: () => list(),
    enabled: !authLoading && Boolean(session),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", kind: "note", provider: "", occurred_on: "", detail: "", policy_number: "" });
  const [revealed, setRevealed] = useState<Record<string, { detail: string | null; policy_number: string | null }>>({});

  const mCreate = useMutation({
    mutationFn: (input: typeof form) => create({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical"] });
      setOpen(false);
      setForm({ title: "", kind: "note", provider: "", occurred_on: "", detail: "", policy_number: "" });
    },
  });
  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical"] }),
  });

  async function onReveal(id: string) {
    if (revealed[id]) {
      setRevealed((r) => {
        const c = { ...r };
        delete c[id];
        return c;
      });
      return;
    }
    const r = await reveal({ data: { id } });
    setRevealed((prev) => ({ ...prev, [id]: { detail: r.detail, policy_number: r.policy_number } }));
  }

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Health"
        title="Medical, encrypted."
        subtitle="Prescriptions, allergies, insurance — sensitive fields are encrypted at rest."
      />

      <section className="px-6 mb-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" strokeWidth={1.75} /> New record
        </button>
      </section>

      {open && (
        <section className="px-6 mb-4">
          <Card>
            <div className="grid gap-3">
              <input
                placeholder="Title (e.g. Amoxicillin 500mg)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm"
                >
                  <option value="note">Note</option>
                  <option value="prescription">Prescription</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="allergy">Allergy</option>
                  <option value="insurance">Insurance</option>
                </select>
                <input
                  placeholder="Provider"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <input
                type="date"
                value={form.occurred_on}
                onChange={(e) => setForm({ ...form, occurred_on: e.target.value })}
                className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Sensitive details (encrypted)"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                rows={3}
                className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
              <input
                placeholder="Policy / Rx number (encrypted)"
                value={form.policy_number}
                onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
                className="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={() => mCreate.mutate(form)}
                disabled={!form.title.trim() || mCreate.isPending}
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50"
              >
                {mCreate.isPending ? "Saving…" : "Save encrypted"}
              </button>
            </div>
          </Card>
        </section>
      )}

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {data.map((m: any) => (
              <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.kind}</p>
                    <p className="mt-0.5 text-sm font-medium">{m.title}</p>
                    {m.provider && <p className="text-xs text-muted-foreground">{m.provider}</p>}
                    {revealed[m.id] && (
                      <div className="mt-2 rounded-lg bg-secondary/60 p-2 text-xs">
                        {revealed[m.id].detail && <p>{revealed[m.id].detail}</p>}
                        {revealed[m.id].policy_number && (
                          <p className="mt-1 text-muted-foreground">#{revealed[m.id].policy_number}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReveal(m.id)}
                      className="rounded-full border border-hairline px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      <Lock className="inline size-3 mr-1" strokeWidth={1.75} />
                      {revealed[m.id] ? "Hide" : "Reveal"}
                    </button>
                    <button
                      onClick={() => mDel.mutate(m.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {data.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No records yet.</li>
            )}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
