import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import { getLatestWeeklyReview } from "@/lib/weekly-review.functions";
import { Check, Calendar } from "lucide-react";
import { PremiumRoute } from "@/components/PremiumRoute";

export const Route = createFileRoute("/review")({
  head: () => ({ meta: [{ title: "Weekly Review — Family COO" }] }),
  component: ReviewPage,
});

type Stats = { tasks_completed?: number; events_count?: number; total_spent_cents?: number };
type UpcomingItem = { title: string; when: string };

function ReviewPage() {
  const fetchReview = useServerFn(getLatestWeeklyReview);
  const { data, isLoading } = useQuery({
    queryKey: ["weekly-review"],
    queryFn: () => fetchReview(),
  });

  const review = data?.review;

  return (
    <PremiumRoute min="pro" feature="Weekly Family Review">
    <AppShell>
      <PageHeader
        back
        eyebrow="Sunday · Family review"
        title={review?.headline ?? "Your weekly review"}
        subtitle="A quiet summary of the past seven days and the week ahead. Generated every Sunday morning."
      />

      <div className="space-y-6 px-6 pb-10">
        {isLoading && (
          <Card>
            <p className="py-6 text-center text-[13px] text-muted-foreground">
              Loading your review…
            </p>
          </Card>
        )}

        {!isLoading && !review && (
          <Card>
            <SectionLabel>No review yet</SectionLabel>
            <p className="text-[14px] text-muted-foreground">
              Your first weekly review will arrive Sunday morning. It's generated from your real
              week: events, completed tasks, and expenses. Nothing to configure.
            </p>
          </Card>
        )}

        {review && (
          <>
            <Card>
              <SectionLabel>Summary</SectionLabel>
              <p className="text-[14px] leading-relaxed text-foreground">{review.summary}</p>
            </Card>

            {(() => {
              const stats = (review.stats as Stats) ?? {};
              const spent = (stats.total_spent_cents ?? 0) / 100;
              return (
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <SectionLabel>Tasks done</SectionLabel>
                    <p className="text-2xl font-semibold">{stats.tasks_completed ?? 0}</p>
                  </Card>
                  <Card>
                    <SectionLabel>Events</SectionLabel>
                    <p className="text-2xl font-semibold">{stats.events_count ?? 0}</p>
                  </Card>
                  <Card>
                    <SectionLabel>Spent</SectionLabel>
                    <p className="text-2xl font-semibold">
                      ${spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </Card>
                </div>
              );
            })()}

            <Card>
              <SectionLabel>Family wins</SectionLabel>
              {(review.wins as string[])?.length ? (
                <ul className="space-y-3">
                  {(review.wins as string[]).map((w, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                      <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  Nothing logged this week — that's OK.
                </p>
              )}
            </Card>

            <Card>
              <SectionLabel>Coming up next week</SectionLabel>
              {(review.upcoming as UpcomingItem[])?.length ? (
                <div className="divide-y divide-hairline">
                  {(review.upcoming as UpcomingItem[]).map((u, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 text-[14px]">
                      <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{u.title}</p>
                        <p className="text-[12px] text-muted-foreground">{u.when}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">Clear week ahead.</p>
              )}
            </Card>

            <p className="text-center text-[11px] text-muted-foreground">
              Generated {new Date(review.generated_at).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </AppShell>
      </PremiumRoute>
  );
}
