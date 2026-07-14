import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, Card, SectionLabel } from "@/components/app-shell";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  listFamilyMembers,
  createFamilyMember,
  deleteFamilyMember,
} from "@/lib/family.functions";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family — Family COO" },
      {
        name: "description",
        content:
          "Manage your household: parents, kids, caregivers. Each family member with their own role and details.",
      },
    ],
  }),
  component: FamilyPage,
});

const palette = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
];

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function FamilyPage() {
  const qc = useQueryClient();
  const list = useServerFn(listFamilyMembers);
  const create = useServerFn(createFamilyMember);
  const remove = useServerFn(deleteFamilyMember);
  const { session, loading: authLoading } = useAuth();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["family-members"],
    queryFn: () => list(),
    enabled: !authLoading && Boolean(session),
  });

  const addMut = useMutation({
    mutationFn: (input: { name: string; role: string }) => create({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to add"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  const [name, setName] = useState("");
  const [role, setRole] = useState("Kid");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addMut.mutate({ name, role });
    setName("");
  }

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="People"
        title="The household."
        subtitle="Parents, kids, caregivers, grandparents — each with their own role."
      />

      <section className="px-6 mb-6">
        <form
          onSubmit={submit}
          className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface p-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add someone…"
            className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-transparent px-2 py-2 text-xs text-muted-foreground focus:outline-none"
          >
            <option>Parent</option>
            <option>Kid</option>
            <option>Nanny</option>
            <option>Grandparent</option>
            <option>Other</option>
          </select>
          <button
            type="submit"
            disabled={addMut.isPending || !name.trim()}
            aria-label="Add"
            className="grid size-8 place-items-center rounded-full bg-zinc-900 text-white disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </form>
      </section>

      <section className="px-6 mb-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : members.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">
              No one added yet. Add your first family member above.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((p, i) => (
              <div
                key={p.id}
                className="group flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4"
              >
                <span
                  className={`grid size-11 place-items-center rounded-full text-sm font-medium ${palette[i % palette.length]}`}
                >
                  {initialsFor(p.name) || "•"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.notes && (
                    <p className="text-xs text-muted-foreground">{p.notes}</p>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.role}
                </span>
                <button
                  onClick={() => delMut.mutate(p.id)}
                  aria-label="Remove"
                  className="ml-2 grid size-8 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-6">
        <SectionLabel>Tip</SectionLabel>
        <Card>
          <p className="text-sm text-muted-foreground">
            The more Family COO knows about who's in the household, the more helpful the briefings
            and Concierge become. Add caregivers so they can be assigned to pickups and tasks.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
