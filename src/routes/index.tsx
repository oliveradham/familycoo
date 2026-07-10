import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, SectionLabel } from "@/components/app-shell";
import { briefing, today, family, inbox } from "@/lib/family-data";
import { useState } from "react";
import { CloudRain, Info, Mic } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Today — Family COO" }] }),
  component: Today,
});

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
        <Link
          to="/onboarding"
          className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          Set up
        </Link>
      </nav>

      {/* Briefing */}
      <header className="px-6 mb-10">
        <h1 className="font-serif italic text-[40px] leading-[1.05] tracking-tight text-foreground">
          Good morning, Aimee.
        </h1>
        <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
          Here's what deserves your attention today. Nothing is on fire — I've prepared
          everything you'll need.
        </p>

        <Card className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Chief-of-staff briefing
            </span>
            <div className="h-px flex-1 bg-hairline" />
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <CloudRain className="size-3" /> Rain · 5 PM
            </span>
          </div>

          <ul className="space-y-5">
            {briefing.map((b) => (
              <BriefingRow key={b.id} b={b} />
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

      {/* Ask anything — natural language always available */}
      <section className="px-6 mb-10">
        <Link
          to="/concierge"
          className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5"
        >
          <Mic className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="flex-1 text-[13px] text-muted-foreground">
            "What does Lily need this week?"
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Ask
          </span>
        </Link>
      </section>

      {/* Answers, not modules */}
      <section className="px-6 mb-10 space-y-3">
        <SectionLabel>Answers to today's questions</SectionLabel>
        <AnswerCard
          to="/calendar"
          question="What is happening today?"
          answer={`${today.length} events. Board meeting at noon, Oliver's tennis at 4:30.`}
        />
        <AnswerCard
          to="/tasks"
          question="What actually needs my attention?"
          answer="2 items — Lily's tuition to approve, passport renewal to start."
        />
        <AnswerCard
          to="/school"
          question="What do I need to do for my children?"
          answer="Sign Lily's field trip slip. Oliver's math quiz Wednesday."
        />
        <AnswerCard
          to="/travel"
          question="What do I need before Tokyo?"
          answer="Passport renewal, rail passes pending, packing 62% ready."
        />
        <AnswerCard
          to="/maintenance"
          question="What needs attention around the house?"
          answer="HVAC filter in 12 days. Pool winterization by Nov 15."
        />
        <AnswerCard
          to="/expenses"
          question="Where is our money going?"
          answer="$9,540 this month. Childcare and travel are up; medical is down."
        />
      </section>

      {/* Today's pulse */}
      <section className="px-6 mb-10">
        <SectionLabel action={<Link to="/calendar">See the week</Link>}>
          Today's shape
        </SectionLabel>
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

      {/* Inbox glance */}
      <section className="px-6 mb-10">
        <SectionLabel action={<Link to="/inbox">Open inbox</Link>}>
          Family inbox
        </SectionLabel>
        <Link
          to="/inbox"
          className="block rounded-3xl border border-hairline bg-surface p-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <InboxTile label="Needs Signature" count={inbox.filter((i) => i.lane === "Needs Signature").length} />
            <InboxTile label="Needs Payment" count={inbox.filter((i) => i.lane === "Needs Payment").length} />
            <InboxTile label="Needs Response" count={inbox.filter((i) => i.lane === "Needs Response").length} />
            <InboxTile label="Waiting on Others" count={inbox.filter((i) => i.lane === "Waiting on Others").length} />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
            {inbox.length} items sorted · 1 needs your confirmation
          </p>
        </Link>
      </section>

      {/* Weekly review teaser */}
      <section className="px-6">
        <Link
          to="/review"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-zinc-900 p-6 text-white"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              Sunday · Family review
            </p>
            <p className="mt-1 font-serif text-2xl italic leading-tight">
              A calm week. Two items still open.
            </p>
          </div>
          <span className="text-lg opacity-70">→</span>
        </Link>
      </section>
    </AppShell>
  );
}

function BriefingRow({ b }: { b: (typeof briefing)[number] }) {
  const [showWhy, setShowWhy] = useState(false);
  const dot =
    b.confidence === "high"
      ? "bg-emerald-500"
      : b.confidence === "medium"
        ? "bg-amber-500"
        : "bg-zinc-300";
  const label =
    b.confidence === "high"
      ? "I can handle this"
      : b.confidence === "medium"
        ? "Suggested — you decide"
        : "Please confirm";
  return (
    <li className="flex gap-4">
      <span className={`mt-2 size-1.5 shrink-0 rounded-full ${dot}`} />
      <div className="flex-1">
        <p className="text-[15px] leading-relaxed text-foreground">{b.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          {b.action && (
            <button className="text-[11px] uppercase tracking-[0.16em] text-foreground underline underline-offset-4">
              {b.action}
            </button>
          )}
          <button
            onClick={() => setShowWhy((s) => !s)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-4"
          >
            Why?
          </button>
        </div>
        {showWhy && (
          <p className="mt-2 flex gap-2 rounded-xl border border-dashed border-hairline p-3 text-[12px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {b.why}
          </p>
        )}
      </div>
    </li>
  );
}

function AnswerCard({
  to,
  question,
  answer,
}: {
  to: string;
  question: string;
  answer: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-4 hover:bg-secondary/50"
    >
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {question}
        </p>
        <p className="mt-1 font-serif text-[17px] italic leading-snug text-foreground">
          {answer}
        </p>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">→</span>
    </Link>
  );
}

function InboxTile({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-2xl bg-secondary/50 px-3 py-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl italic leading-none">{count}</p>
    </div>
  );
}
