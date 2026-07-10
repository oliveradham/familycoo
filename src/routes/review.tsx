import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import { weeklyReview } from "@/lib/family-data";
import { Check } from "lucide-react";

export const Route = createFileRoute("/review")({
  head: () => ({ meta: [{ title: "Weekly Review — Family COO" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Sunday · Family review"
        title={weeklyReview.headline}
        subtitle="A quiet summary of the past seven days and the week ahead. Nothing urgent — this is context, not homework."
      />

      <div className="space-y-6 px-6 pb-10">
        <Card>
          <SectionLabel>Family wins</SectionLabel>
          <ul className="space-y-3">
            {weeklyReview.wins.map((w) => (
              <li key={w} className="flex gap-3 text-[14px] leading-relaxed">
                <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {w}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionLabel>Coming up next week</SectionLabel>
          <div className="divide-y divide-hairline">
            {weeklyReview.upcoming.map((u) => (
              <div
                key={u.label}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-[14px]">{u.label}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {u.when}
                  </p>
                </div>
                <p className="font-serif text-lg italic">{u.amount}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Still needs attention</SectionLabel>
          <ul className="space-y-3">
            {weeklyReview.attention.map((a) => (
              <li
                key={a}
                className="flex gap-3 text-[14px] leading-relaxed text-foreground/80"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-muted-foreground">
            There's time to complete these — no rush this weekend.
          </p>
        </Card>

        <Card>
          <SectionLabel>Where the money went</SectionLabel>
          <div className="divide-y divide-hairline">
            {weeklyReview.trends.map((t) => (
              <div key={t.label} className="flex items-baseline justify-between gap-3 py-3">
                <div className="flex-1">
                  <p className="text-[14px]">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">{t.note}</p>
                </div>
                <p
                  className={`font-serif text-lg italic ${
                    t.value.startsWith("+") ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {t.value}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Link
          to="/concierge"
          className="flex items-center justify-between rounded-3xl bg-zinc-900 p-6 text-white"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              Ask me anything
            </p>
            <p className="mt-1 font-serif text-xl italic leading-tight">
              {weeklyReview.prompt}
            </p>
          </div>
          <span className="text-lg opacity-70">→</span>
        </Link>
      </div>
    </AppShell>
  );
}
