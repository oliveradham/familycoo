import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { listEvents, createEvent, deleteEvent } from "@/lib/events.functions";
import { useAuth } from "@/lib/auth-context";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Family COO" },
      { name: "description", content: "One unified household calendar — school, sports, work, medical, and travel." },
      { property: "og:title", content: "Family Calendar — Family COO" },
      { property: "og:description", content: "Your household's unified schedule." },
      { property: "og:url", content: "https://family-coo.com/calendar" },
    ],
    links: [{ rel: "canonical", href: "https://family-coo.com/calendar" }],
  }),
  component: CalendarPage,
});

const categoryDot: Record<string, string> = {
  school: "bg-emerald-500",
  sports: "bg-amber-500",
  work: "bg-zinc-900",
  medical: "bg-rose-500",
  family: "bg-sky-500",
  travel: "bg-violet-500",
};

function dayKey(d: string) {
  return new Date(d).toDateString();
}

function CalendarPage() {
  const list = useServerFn(listEvents);
  const create = useServerFn(createEvent);
  const del = useServerFn(deleteEvent);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => list({}),
    enabled: !authLoading && Boolean(session),
  });

  const inv = () => qc.invalidateQueries({ queryKey: ["events"] });
  const addMut = useMutation({
    mutationFn: (v: { title: string; starts_at: string; category?: string }) =>
      create({ data: v }),
    onSuccess: inv,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: inv,
  });

  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [category, setCategory] = useState("family");

  const grouped: Record<string, any[]> = {};
  for (const e of events as any[]) {
    (grouped[dayKey(e.starts_at)] ||= []).push(e);
  }
  const dayKeys = Object.keys(grouped);

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Unified calendar"
        title="The next two weeks."
        subtitle="Everything the household has committed to. Add one, and it's on every phone."
      />

      <section className="px-6 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !when) return;
            addMut.mutate({
              title: title.trim(),
              starts_at: new Date(when).toISOString(),
              category,
            });
            setTitle("");
            setWhen("");
          }}
          className="rounded-2xl border border-hairline bg-surface p-3 space-y-2"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title…"
            aria-label="Event title"
            className="w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              aria-label="Date and time"
              className="rounded-lg border border-hairline bg-background px-2 py-1.5 text-xs"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
              className="rounded-lg border border-hairline bg-background px-2 py-1.5 text-xs"
            >
              {Object.keys(categoryDot).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!title.trim() || !when || addMut.isPending}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>
        </form>
      </section>

      {isLoading && <p className="px-6 text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && dayKeys.length === 0 && (
        <p className="px-6 text-sm text-muted-foreground">
          Nothing scheduled. Add your first event above.
        </p>
      )}

      {dayKeys.map((k) => (
        <section key={k} className="px-6 mb-8">
          <SectionLabel>{new Date(k).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</SectionLabel>
          <div className="space-y-2">
            {grouped[k].map((e) => (
              <div key={e.id} className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-4">
                <div className="w-14 shrink-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(e.starts_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <span className={`mt-2 block h-1 w-6 rounded-full ${categoryDot[e.category] ?? "bg-zinc-400"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  {e.location && <p className="mt-0.5 text-xs text-muted-foreground">{e.location}</p>}
                </div>
                <button
                  onClick={() => delMut.mutate(e.id)}
                  aria-label="Delete event"
                  className="text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
