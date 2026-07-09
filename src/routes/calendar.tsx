import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel } from "@/components/app-shell";
import { today, upcoming, family } from "@/lib/family-data";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Family COO" }] }),
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

function CalendarPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Unified calendar"
        title="This week."
        subtitle="School, sports, work, medical, travel — reconciled. Conflicts flagged before they happen."
      />

      <section className="px-6 mb-10">
        <SectionLabel>Today · Oct 14</SectionLabel>
        <div className="space-y-2">
          {today.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-4"
            >
              <div className="w-14 shrink-0">
                <p className="text-xs font-medium text-muted-foreground">{e.time}</p>
                <span
                  className={`mt-2 block h-1 w-6 rounded-full ${categoryDot[e.category]}`}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{e.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
              </div>
              <div className="flex -space-x-1.5">
                {e.who.map((id) => {
                  const p = family.find((f) => f.id === id);
                  return (
                    <span
                      key={id}
                      className={`grid size-6 place-items-center rounded-full text-[10px] font-medium ring-2 ring-surface ${p?.color ?? "bg-stone-200"}`}
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

      {upcoming.map((day) => (
        <section key={day.day} className="px-6 mb-8">
          <SectionLabel>
            {day.day} · {day.date}
          </SectionLabel>
          <div className="space-y-2">
            {day.events.map((e) => (
              <div
                key={e.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 ${
                  e.priority ? "border-transparent bg-zinc-900 text-white" : "border-hairline bg-surface"
                }`}
              >
                <div className="w-14 shrink-0">
                  <p className={`text-xs font-medium ${e.priority ? "text-white/60" : "text-muted-foreground"}`}>
                    {e.time}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className={`mt-0.5 text-xs ${e.priority ? "text-white/60" : "text-muted-foreground"}`}>
                    {e.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="px-6">
        <div className="rounded-3xl border border-dashed border-hairline bg-secondary/40 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Conflict detected
          </p>
          <p className="mt-2 font-serif text-lg italic">
            Thursday: Lily's field trip and Aimee's 10 AM dentist overlap pickup.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            I've suggested moving the dentist to 8:30 AM — reply "confirm" to reschedule.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
