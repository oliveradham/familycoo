import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import {
  listSportTeams,
  createSportTeam,
  deleteSportTeam,
  listSportEvents,
  createSportEvent,
  deleteSportEvent,
} from "@/lib/sports.functions";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/sports")({
  head: () => ({ meta: [{ title: "Sports — Family COO" }] }),
  component: SportsPage,
});

type EventKind = "practice" | "game" | "tournament" | "other";

function SportsPage() {
  const listTeams = useServerFn(listSportTeams);
  const createTeam = useServerFn(createSportTeam);
  const delTeam = useServerFn(deleteSportTeam);
  const listEvents = useServerFn(listSportEvents);
  const createEvent = useServerFn(createSportEvent);
  const delEvent = useServerFn(deleteSportEvent);
  const { session, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["sport_teams"],
    queryFn: () => listTeams({}),
    enabled: !authLoading && Boolean(session),
  });
  const { data: events = [] } = useQuery({
    queryKey: ["sport_events"],
    queryFn: () => listEvents({}),
    enabled: !authLoading && Boolean(session),
  });

  const invTeams = () => qc.invalidateQueries({ queryKey: ["sport_teams"] });
  const invEvents = () => qc.invalidateQueries({ queryKey: ["sport_events"] });

  const addTeamMut = useMutation({
    mutationFn: (v: { sport: string; team_name?: string; season?: string }) =>
      createTeam({ data: v }),
    onSuccess: invTeams,
  });
  const delTeamMut = useMutation({
    mutationFn: (id: string) => delTeam({ data: { id } }),
    onSuccess: () => {
      invTeams();
      invEvents();
    },
  });
  const addEventMut = useMutation({
    mutationFn: (v: {
      team_id: string;
      kind: EventKind;
      starts_at: string;
      location?: string;
    }) => createEvent({ data: v }),
    onSuccess: invEvents,
  });
  const delEventMut = useMutation({
    mutationFn: (id: string) => delEvent({ data: { id } }),
    onSuccess: invEvents,
  });

  const [sport, setSport] = useState("");
  const [teamName, setTeamName] = useState("");
  const [season, setSeason] = useState("");

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Season"
        title="Practices, games, tournaments."
        subtitle="Track every kid's teams and schedules in one place."
      />

      <section className="px-6 mb-6">
        <SectionLabel>Add team</SectionLabel>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!sport.trim()) return;
            addTeamMut.mutate({
              sport: sport.trim(),
              team_name: teamName.trim() || undefined,
              season: season.trim() || undefined,
            });
            setSport("");
            setTeamName("");
            setSeason("");
          }}
          className="flex flex-wrap gap-2 rounded-2xl border border-hairline bg-surface p-3"
        >
          <input
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="Sport (e.g. Soccer)"
            className="flex-1 min-w-[140px] bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team"
            className="flex-1 min-w-[120px] bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season"
            className="w-28 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!sport.trim() || addTeamMut.isPending}
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Team
          </button>
        </form>
      </section>

      {teamsLoading && <p className="px-6 text-sm text-muted-foreground">Loading…</p>}

      <section className="px-6 space-y-4">
        {teams.length === 0 && !teamsLoading && (
          <p className="text-sm text-muted-foreground">No teams yet. Add one above.</p>
        )}
        {teams.map((t: any) => {
          const teamEvents = events.filter((e: any) => e.team_id === t.id);
          return (
            <Card key={t.id}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t.team_name || t.season || "Team"}
                  </p>
                  <p className="mt-0.5 font-serif text-2xl italic leading-tight">{t.sport}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.ranking && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-widest">
                      {t.ranking}
                    </span>
                  )}
                  <button
                    onClick={() => delTeamMut.mutate(t.id)}
                    className="text-muted-foreground hover:text-red-600"
                    aria-label="Delete team"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <TeamEventForm
                onAdd={(v) => addEventMut.mutate({ ...v, team_id: t.id })}
                pending={addEventMut.isPending}
              />

              <div className="mt-3 space-y-2">
                {teamEvents.length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming events.</p>
                )}
                {teamEvents.map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-hairline bg-surface p-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {e.kind}
                      </p>
                      <p className="mt-0.5 text-sm">
                        {new Date(e.starts_at).toLocaleString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {e.location && (
                        <p className="text-xs text-muted-foreground">{e.location}</p>
                      )}
                    </div>
                    <button
                      onClick={() => delEventMut.mutate(e.id)}
                      className="text-muted-foreground hover:text-red-600"
                      aria-label="Delete event"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </section>
    </AppShell>
  );
}

function TeamEventForm({
  onAdd,
  pending,
}: {
  onAdd: (v: { kind: EventKind; starts_at: string; location?: string }) => void;
  pending: boolean;
}) {
  const [kind, setKind] = useState<EventKind>("practice");
  const [when, setWhen] = useState("");
  const [loc, setLoc] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!when) return;
        onAdd({
          kind,
          starts_at: new Date(when).toISOString(),
          location: loc.trim() || undefined,
        });
        setWhen("");
        setLoc("");
      }}
      className="flex flex-wrap gap-2 rounded-xl border border-hairline bg-secondary/30 p-2"
    >
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as EventKind)}
        className="rounded-lg border border-hairline bg-transparent px-2 py-1.5 text-xs"
      >
        <option value="practice">Practice</option>
        <option value="game">Game</option>
        <option value="tournament">Tournament</option>
        <option value="other">Other</option>
      </select>
      <input
        type="datetime-local"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        className="rounded-lg border border-hairline bg-transparent px-2 py-1.5 text-xs"
      />
      <input
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        placeholder="Location"
        className="flex-1 min-w-[100px] rounded-lg border border-hairline bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={!when || pending}
        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white disabled:opacity-40"
      >
        <Plus className="size-3" /> Add
      </button>
    </form>
  );
}
