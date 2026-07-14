import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { AppShell, Card, SectionLabel } from "@/components/app-shell";
import { listEvents } from "@/lib/events.functions";
import { listTasks } from "@/lib/tasks.functions";
import { listInbox } from "@/lib/inbox.functions";
import { getMyProfile } from "@/lib/profile.functions";
import {
  Clock,
  Mic,
  Sparkles,
  Settings as SettingsIcon,
  Plus,
} from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Family COO — AI Command Center for Busy Families" },
      {
        name: "description",
        content:
          "AI Chief Operating Officer for busy families. Briefings, calendar, school, sports, travel, groceries, and medical in one calm command center.",
      },
      { property: "og:title", content: "Family COO — AI Command Center for Busy Families" },
      {
        property: "og:description",
        content:
          "Not a calendar. A proactive family operating system that removes invisible mental load for dual-career households.",
      },
      { property: "og:url", content: "https://family-coo.com/" },
      { property: "og:image", content: "https://family-coo.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://family-coo.com/og-image.jpg" },
      { name: "twitter:title", content: "Family COO — AI Command Center for Busy Families" },
      {
        name: "twitter:description",
        content: "Not a calendar. A proactive family operating system that removes invisible mental load.",
      },
    ],
    links: [{ rel: "canonical", href: "https://family-coo.com/" }],
  }),
  component: Today,
});

const features: { to: string; label: string; hint: string }[] = [
  { to: "/calendar", label: "Calendar", hint: "Unified family week" },
  { to: "/tasks", label: "Tasks", hint: "What needs doing" },
  { to: "/family", label: "Family", hint: "People & profiles" },
  { to: "/school", label: "School hub", hint: "Forms, tuition, events" },
  { to: "/sports", label: "Sports", hint: "Practices & games" },
  { to: "/travel", label: "Travel", hint: "Trips & readiness" },
  { to: "/groceries", label: "Groceries", hint: "What to buy" },
  { to: "/medical", label: "Medical", hint: "Appointments & Rx" },
  { to: "/maintenance", label: "Home", hint: "Household upkeep" },
  { to: "/vault", label: "Document vault", hint: "Secure paperwork" },
  { to: "/expenses", label: "Expenses", hint: "Spend patterns" },
  { to: "/plans", label: "Plans", hint: "Free · Pro · Pro Max" },
];

function EmptyLine({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-dashed border-hairline px-4 py-3.5 text-muted-foreground hover:bg-secondary/40"
    >
      <Plus className="size-3.5" strokeWidth={1.75} />
      <span className="flex-1 text-sm">{text}</span>
      <span className="text-[10px] uppercase tracking-widest">{cta}</span>
    </Link>
  );
}

function greetingFor(now: Date) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatEventTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = h % 12 || 12;
  const mm = m.toString().padStart(2, "0");
  return `${hh}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

function relativeDay(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfThat - startOfToday) / (24 * 3600 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7)
    return d.toLocaleDateString(undefined, { weekday: "long" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Today() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const { data: inbox } = useSuspenseQuery(inboxQuery);

  const now = new Date();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayEvents = events.filter((e: any) => {
    const t = new Date(e.starts_at).getTime();
    return t >= now.getTime() - 4 * 3600 * 1000 && t <= todayEnd.getTime();
  });
  const upcomingEvents = events
    .filter((e: any) => new Date(e.starts_at).getTime() > todayEnd.getTime())
    .slice(0, 4);

  const openTasks = tasks.filter((t: any) => t.status === "open" || t.status === "pending");
  const highPriorityTasks = openTasks.filter((t: any) => t.priority === "high").slice(0, 3);

  const openInbox = inbox.filter((i: any) => i.status === "open");

  const firstName = profile.display_name?.split(" ")[0] ?? "there";
  const initial = (profile.display_name?.[0] ?? "?").toUpperCase();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const isFirstTime =
    events.length === 0 && tasks.length === 0 && inbox.length === 0;

  return (
    <AppShell>
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 pt-10 pb-6">
        <Link to="/settings" className="flex items-center gap-3" aria-label="Open settings">
          <div className="grid size-10 place-items-center rounded-full bg-zinc-900 text-[13px] font-medium text-white ring-1 ring-black/5">
            {initial}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {dateLabel}
            </p>
            <p className="text-sm font-medium text-foreground">
              {profile.display_name ?? "Your household"}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/calm"
            className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
          >
            Calm mode
          </Link>
          <Link
            to="/settings"
            aria-label="Settings"
            className="grid size-9 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground"
          >
            <SettingsIcon className="size-4" strokeWidth={1.75} />
          </Link>
        </div>
      </nav>

      {/* Command Center headline */}
      <header className="px-6 mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Family Command Center
        </p>
        <h1 className="mt-2 font-serif italic text-[38px] leading-[1.05] tracking-tight text-foreground">
          {isFirstTime ? "Welcome." : "Everything is in hand."}
        </h1>
        <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
          {isFirstTime
            ? `${greetingFor(now)}, ${firstName}. Add your first event, task, or family member to get started — or load a sample family in Settings to see what Family COO can do.`
            : `${greetingFor(now)}, ${firstName}. ${openInbox.length} inbox item${openInbox.length === 1 ? "" : "s"} open · ${openTasks.length} task${openTasks.length === 1 ? "" : "s"} on the list.`}
        </p>
      </header>

      {/* Today */}
      <section className="px-6 mb-6">
        <SectionLabel action={<Link to="/calendar">Week</Link>}>Today</SectionLabel>
        {todayEvents.length === 0 ? (
          <EmptyLine text="Nothing on today's calendar yet." cta="Add event" to="/calendar" />
        ) : (
          <Card>
            <ul className="space-y-4">
              {todayEvents.map((e: any) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                  <div className="flex-1">
                    <p className="text-[15px] leading-snug">{e.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {formatEventTime(e.starts_at)}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Coming next */}
      <section className="px-6 mb-6">
        <SectionLabel action={<Link to="/calendar">All</Link>}>Coming next</SectionLabel>
        {upcomingEvents.length === 0 ? (
          <EmptyLine text="Add something coming up this week." cta="Add" to="/calendar" />
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3"
              >
                <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <p className="flex-1 text-sm">{e.title}</p>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {relativeDay(e.starts_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* High priority */}
      {highPriorityTasks.length > 0 && (
        <section className="px-6 mb-6">
          <SectionLabel action={<Link to="/tasks">All</Link>}>High priority</SectionLabel>
          <div className="space-y-2">
            {highPriorityTasks.map((t: any) => (
              <Link
                key={t.id}
                to="/tasks"
                className="flex items-start gap-3 rounded-2xl bg-zinc-900 px-4 py-3.5 text-white"
              >
                <Sparkles className="mt-0.5 size-3.5 shrink-0 opacity-70" strokeWidth={1.5} />
                <p className="flex-1 text-sm leading-snug">{t.title}</p>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-zinc-900">
                  Open
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Voice / concierge */}
      <section className="px-6 mb-8">
        <Link
          to="/concierge"
          className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5"
        >
          <Mic className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="flex-1 text-[13px] text-muted-foreground">
            Ask anything — "Add milk", "What's on tomorrow?", "Remind me Friday".
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
            <p className="mt-1 font-serif text-xl italic">
              {inbox.length === 0
                ? "Empty — connect email or add items."
                : `${inbox.length} item${inbox.length === 1 ? "" : "s"} · ${openInbox.length} open`}
            </p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
      </section>

      {/* Plans */}
      <section className="px-6 mb-6 space-y-2">
        <Link
          to="/plans"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              You're on Free
            </p>
            <p className="mt-1 font-serif text-xl italic">See what Pro quietly unlocks.</p>
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
            <p className="mt-1 font-serif text-2xl italic leading-tight">
              Reflect on the week when it wraps up.
            </p>
          </div>
          <span className="text-lg opacity-70">→</span>
        </Link>
      </section>
    </AppShell>
  );
}
