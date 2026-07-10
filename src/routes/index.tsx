import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, SectionLabel } from "@/components/app-shell";
import { commandCenter, family, inbox } from "@/lib/family-data";
import { AlertTriangle, Check, Clock, Mic, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center — Family COO" }] }),
  component: Today,
});

const features: { to: string; label: string; hint: string }[] = [
  { to: "/responsibilities", label: "Who's doing what", hint: "Live responsibility map" },
  { to: "/conflicts", label: "Conflicts", hint: "5 detected · solutions ready" },
  { to: "/waiting", label: "Waiting on", hint: "5 open · 1 needs a nudge" },
  { to: "/handoff", label: "Handoff", hint: "For Sofia this afternoon" },
  { to: "/checklists", label: "Checklists", hint: "Tennis · Ballet · Tokyo" },
  { to: "/departure", label: "Departure times", hint: "Leave by 3:50 PM today" },
  { to: "/autopilot", label: "Autopilot", hint: "8 rules · 6 on" },
  { to: "/decisions", label: "Decisions", hint: "3 open · tradeoffs mapped" },
  { to: "/readiness", label: "Tokyo readiness", hint: "76% · 6 to go" },
  { to: "/gifts", label: "Gifts", hint: "Mia's party Saturday" },
  { to: "/returns", label: "Returns & refunds", hint: "2 windows closing" },
  { to: "/purchases", label: "Purchase memory", hint: "Sizes, brands, dislikes" },
  { to: "/health-prep", label: "Health prep", hint: "Lily · Tue 10:30 AM" },
  { to: "/scenarios", label: "Scenarios", hint: '"What if…" planning' },
  { to: "/capture", label: "Capture", hint: "Screenshot or photo" },
  { to: "/search", label: "Family search", hint: "Ask anything" },
  { to: "/emergency", label: "Emergency", hint: "One-tap essentials" },
  { to: "/history", label: "Family memory", hint: "Moments worth keeping" },
];

function Today() {
  return (
    <AppShell>
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-zinc-900 text-[13px] font-medium text-white ring-1 ring-black/5">
            A
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Monday · Oct 14
            </p>
            <p className="text-sm font-medium text-foreground">Aimee Thompson</p>
          </div>
        </div>
        <Link
          to="/calm"
          className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          Calm mode
        </Link>
      </nav>

      {/* Command Center headline */}
      <header className="px-6 mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Family Command Center
        </p>
        <h1 className="mt-2 font-serif italic text-[38px] leading-[1.05] tracking-tight text-foreground">
          Everything is in hand.
        </h1>
        <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
          One item needs your approval. Two are quietly at risk. I've handled four things for you since this morning.
        </p>
      </header>

      {/* Today — needs attention */}
      <section className="px-6 mb-6">
        <SectionLabel>Today · needs attention</SectionLabel>
        <Card>
          <ul className="space-y-4">
            {commandCenter.today.map((t) => {
              const owner = family.find((f) => f.id === t.owner);
              return (
                <li key={t.id} className="flex items-start gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                  <div className="flex-1">
                    <p className="text-[15px] leading-snug">{t.text}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {t.tag} · {owner?.name.split(" ")[0] ?? "Unassigned"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* Coming next */}
      <section className="px-6 mb-6">
        <SectionLabel action={<Link to="/calendar">Week</Link>}>Coming next</SectionLabel>
        <div className="space-y-2">
          {commandCenter.coming.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3">
              <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              <p className="flex-1 text-sm">{c.text}</p>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.when}</span>
            </div>
          ))}
        </div>
      </section>

      {/* At risk */}
      <section className="px-6 mb-6">
        <SectionLabel>At risk of being forgotten</SectionLabel>
        <div className="space-y-2">
          {commandCenter.atRisk.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-4 py-3">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-700" strokeWidth={1.75} />
              <p className="flex-1 text-sm leading-snug">{r.text}</p>
              <button className="text-[11px] uppercase tracking-[0.14em] text-zinc-900 underline underline-offset-4">
                {r.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Decisions needing approval */}
      <section className="px-6 mb-6">
        <SectionLabel>Needs your approval</SectionLabel>
        <div className="space-y-2">
          {commandCenter.approvals.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-zinc-900 px-4 py-3.5 text-white">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 opacity-70" strokeWidth={1.5} />
              <p className="flex-1 text-sm leading-snug">{a.text}</p>
              <button className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-zinc-900">
                {a.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Handled */}
      <section className="px-6 mb-8">
        <SectionLabel action={<Link to="/autopilot">Autopilot</Link>}>Family COO handled</SectionLabel>
        <Card>
          <ul className="space-y-3">
            {commandCenter.handled.map((h) => (
              <li key={h.id} className="flex items-start gap-3">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
                <p className="flex-1 text-[14px] leading-snug text-foreground/90">{h.text}</p>
                <button className="text-[10px] uppercase tracking-widest text-muted-foreground underline underline-offset-4">
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Voice */}
      <section className="px-6 mb-8">
        <Link
          to="/concierge"
          className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5"
        >
          <Mic className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="flex-1 text-[13px] text-muted-foreground">
            "Add milk. Remind Basil about tennis. Waiting on the doctor."
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hold</span>
        </Link>
      </section>

      {/* Feature grid */}
      <section className="px-6 mb-10">
        <SectionLabel>All of Family COO</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="rounded-2xl border border-hairline bg-surface p-4 hover:bg-secondary/50"
            >
              <p className="font-serif text-[16px] italic leading-tight">{f.label}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{f.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Inbox glance */}
      <section className="px-6 mb-6">
        <Link
          to="/inbox"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Family inbox</p>
            <p className="mt-1 font-serif text-xl italic">{inbox.length} items sorted · 1 needs you</p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
      </section>

      {/* Sunday review */}
      <section className="px-6">
        <Link
          to="/review"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-zinc-900 p-6 text-white"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              Sunday · Family review
            </p>
            <p className="mt-1 font-serif text-2xl italic leading-tight">A calm week. Two items still open.</p>
          </div>
          <span className="text-lg opacity-70">→</span>
        </Link>
      </section>
    </AppShell>
  );
}
