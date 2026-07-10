import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSubscription, tierMeets, type Tier } from "@/hooks/useSubscription";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Lock, Sparkles } from "lucide-react";

/**
 * Wrap premium routes to enforce a minimum paid tier on the client.
 * The server also enforces access via `assertPaidTier` inside server fns.
 * Free/inactive users see a paywall panel with a jump-to-plans CTA.
 */
export function PremiumRoute({
  min = "pro",
  feature,
  children,
}: {
  min?: Exclude<Tier, "free">;
  feature: string;
  children: ReactNode;
}) {
  const { tier, loading, isActive } = useSubscription();
  const navigate = useNavigate();
  const allowed = isActive && tierMeets(tier, min);

  useEffect(() => {
    // Prefetch plans route
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="grid min-h-[40vh] place-items-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Loading…</p>
        </div>
      </AppShell>
    );
  }

  if (!allowed) {
    return (
      <AppShell>
        <PageHeader
          back
          eyebrow="Premium"
          title={`${feature} is a ${min === "max" ? "Pro Max" : "Pro"} feature.`}
          subtitle="Upgrade to unlock. Your data stays exactly where it is — nothing to migrate."
        />
        <section className="px-6 pb-10">
          <Card>
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-zinc-900 text-white">
                <Lock className="size-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="font-serif text-[19px] italic leading-tight">
                  {min === "max" ? "Pro Max unlocks this." : "Pro unlocks this."}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Try free for 14 days — cancel anytime. You'll keep your household, calendar, and inbox as-is.
                </p>
                <button
                  onClick={() => navigate({ to: "/plans" })}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-[11px] font-medium uppercase tracking-widest text-white"
                >
                  <Sparkles className="size-3.5" strokeWidth={2} />
                  See plans
                </button>
              </div>
            </div>
          </Card>
        </section>
      </AppShell>
    );
  }

  return <>{children}</>;
}
