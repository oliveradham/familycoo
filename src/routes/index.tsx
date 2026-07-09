import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, SectionLabel } from "@/components/app-shell";
import { briefing, today, pantry, family } from "@/lib/family-data";
import {
  Calendar,
  GraduationCap,
  Trophy,
  Plane,
  ShoppingBasket,
  Wrench,
  HeartPulse,
  FileText,
  Wallet,
  Sparkles,
  Users,
  CloudRain,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Today,
});

const modules = [
  { to: "/calendar", label: "Calendar", eyebrow: "Unified", meta: "6 events today", Icon: Calendar },
  { to: "/school", label: "School Hub", eyebrow: "Logistics", meta: "3 emails summarized", Icon: GraduationCap },
  { to: "/sports", label: "Sports", eyebrow: "Season", meta: "Tournament Fri–Sun", Icon: Trophy },
  { to: "/travel", label: "Travel", eyebrow: "Trips", meta: "Tokyo in 10 days", Icon: Plane },
  { to: "/groceries", label: "Groceries", eyebrow: "Household", meta: "4 items low", Icon: ShoppingBasket },
  { to: "/maintenance", label: "Maintenance", eyebrow: "Household", meta: "HVAC in 12 days", Icon: Wrench },
  { to: "/medical", label: "Medical", eyebrow: "Health", meta: "Flu shot due", Icon: HeartPulse },
  { to: "/tasks", label: "Tasks", eyebrow: "Assignments", meta: "5 open", Icon: Sparkles },
  { to: "/family", label: "Family", eyebrow: "People", meta: "5 members", Icon: Users },
];

function Today() {
  return (
    <AppShell>
      {/* Greeting */}
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
        <button
          className="grid size-10 place-items-center rounded-full border border-hairline bg-surface"
          aria-label="Settings"
        >
          <span className="size-2 rounded-full bg-foreground" />
        </button>
      </nav>

      {/* Briefing */}
      <header className="px-6 mb-10">
        <h1 className="font-serif italic text-[40px] leading-[1.05] tracking-tight text-foreground">
          Good morning, Aimee.
        </h1>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
          Five things need your attention today. I've drafted the moves.
        </p>

        <Card className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              AI Executive Summary
            </span>
            <div className="h-px flex-1 bg-hairline" />
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <CloudRain className="size-3" /> 5 PM
            </span>
          </div>

          <ul className="space-y-4">
            {briefing.map((b) => (
              <li key={b.id} className="flex gap-4">
                <span
                  className={`mt-2 size-1.5 shrink-0 rounded-full ${
                    b.priority === "high" ? "bg-zinc-900" : "bg-zinc-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-[15px] leading-relaxed text-foreground">{b.text}</p>
                  {b.action && (
                    <button className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 hover:text-foreground">
                      {b.action}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/concierge"
            className="mt-6 flex items-center justify-between rounded-2xl bg-zinc-900 px-5 py-3.5 text-white transition-transform active:scale-[0.99]"
          >
            <span className="text-sm font-medium">Ask about today</span>
            <span className="text-xs opacity-70">→</span>
          </Link>
        </Card>
      </header>

      {/* Today's pulse */}
      <section className="px-6 mb-10">
        <SectionLabel action={<Link to="/calendar">View calendar</Link>}>Today's pulse</SectionLabel>
        <div className="space-y-2.5">
          {today.slice(0, 4).map((e) => (
            <div
              key={e.id}
              className={`flex gap-4 rounded-2xl border p-4 ${
                e.priority
                  ? "border-transparent bg-zinc-900 text-white"
                  : "border-hairline bg-secondary/60"
              }`}
            >
              <div className="w-12 shrink-0 text-center">
                <p
                  className={`text-[11px] font-medium uppercase tracking-wide ${
                    e.priority ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {e.time}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{e.title}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    e.priority ? "italic text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {e.detail}
                </p>
              </div>
              <div className="flex -space-x-1.5">
                {e.who.slice(0, 3).map((id) => {
                  const p = family.find((f) => f.id === id);
                  return (
                    <span
                      key={id}
                      className={`grid size-6 place-items-center rounded-full text-[10px] font-medium ring-2 ${
                        e.priority ? "ring-zinc-900" : "ring-surface"
                      } ${p?.color ?? "bg-stone-200 text-zinc-900"}`}
                    >
                      {p?.initials}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules grid */}
      <section className="px-6 mb-10">
        <SectionLabel>Operations</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {modules.map(({ to, label, eyebrow, meta, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex aspect-square flex-col justify-between rounded-3xl border border-hairline bg-surface p-5 transition-colors hover:bg-secondary/50"
            >
              <div className="grid size-9 place-items-center rounded-xl bg-secondary">
                <Icon className="size-4 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {eyebrow}
                </p>
                <p className="mt-0.5 font-serif text-xl italic leading-tight text-foreground">
                  {label}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground/80">{meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pantry alert */}
      <section className="px-6 mb-10">
        <div className="rounded-3xl border border-dashed border-hairline bg-secondary/40 p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Pantry alert</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Refill suggested based on consumption
              </p>
            </div>
            <Link
              to="/groceries"
              className="rounded-full border border-hairline bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-foreground"
            >
              Order
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pantry.low.map((p) => (
              <span
                key={p.item}
                className="rounded-md border border-hairline bg-surface px-2 py-1 text-[11px] text-foreground/80"
              >
                {p.item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quick vault + spend */}
      <section className="grid grid-cols-2 gap-3 px-6">
        <Link to="/vault" className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-5 aspect-square">
          <div className="grid size-9 place-items-center rounded-xl bg-secondary">
            <FileText className="size-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Vault
            </p>
            <p className="mt-0.5 font-serif text-xl italic leading-tight">Documents</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground/80">Passport renewal ready</p>
          </div>
        </Link>
        <Link to="/expenses" className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-5 aspect-square">
          <div className="grid size-9 place-items-center rounded-xl bg-secondary">
            <Wallet className="size-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Insights
            </p>
            <p className="mt-0.5 font-serif text-xl italic leading-tight">Household spend</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground/80">$9,540 · Oct so far</p>
          </div>
        </Link>
      </section>
    </AppShell>
  );
}
