import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { plans } from "@/lib/family-data";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Pricing — Free, Pro & Pro Max | Family COO" },
      {
        name: "description",
        content:
          "Family COO pricing: start free, upgrade to Pro at $49.99/mo or Pro Max at $99.99/mo. Cancel anytime with a 30-day money-back guarantee.",
      },
      { property: "og:title", content: "Family COO Pricing — Free, Pro, Pro Max" },
      {
        property: "og:description",
        content: "Three plans for busy households. Start free; upgrade when the calm becomes something you'd pay to keep.",
      },
      { property: "og:url", content: "https://familycoo.lovable.app/plans" },
      { property: "og:image", content: "https://familycoo.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://familycoo.lovable.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/plans" }],
  }),
  component: Page,
});

const PRICE_IDS: Record<string, string> = {
  pro: "pro_monthly",
  max: "max_monthly",
};

function Page() {
  const { openCheckout, loading } = usePaddleCheckout();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();

  const handleClick = async (planId: string) => {
    if (planId === "free") return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const priceId = PRICE_IDS[planId];
    if (!priceId) return;
    await openCheckout({
      priceId,
      userId: user.id,
      customerEmail: user.email ?? undefined,
      successUrl: `${window.location.origin}/checkout/success`,
    });
  };

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Plans"
        title="Room to grow with your family."
        subtitle="Start free. Upgrade when the calm becomes something you'd pay to keep."
      />

      <section className="px-6 space-y-4">
        {plans.map((p) => {
          const isCurrent = tier === p.id;
          const label = isCurrent
            ? "Current plan"
            : p.id === "free"
              ? "You are here"
              : loading
                ? "Opening checkout…"
                : p.cta;
          return (
          <Card
            key={p.id}
            className={
              p.featured
                ? "border-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.03),0_10px_30px_-15px_rgba(0,0,0,0.15)]"
                : ""
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.best}
                </p>
                <p className="mt-1 font-serif text-[22px] italic leading-tight">{p.name}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{p.tagline}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-[26px] italic leading-none">{p.price}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.cadence}
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {p.includes.map((i, k) => (
                <li key={k} className="flex items-start gap-2.5 text-[14px] leading-snug">
                  <Check className="mt-1 size-3.5 shrink-0 text-emerald-600" strokeWidth={2} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            {p.limits && (
              <div className="mt-4 rounded-2xl bg-secondary/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Fair-use limits
                </p>
                <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
                  {p.limits.map((l, k) => (
                    <li key={k}>· {l}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleClick(p.id)}
              disabled={p.id === "free" || isCurrent || loading}
              className={`mt-5 w-full rounded-full px-4 py-3 text-[12px] font-medium uppercase tracking-widest inline-flex items-center justify-center gap-2 disabled:opacity-60 ${
                p.featured
                  ? "bg-zinc-900 text-white"
                  : "border border-hairline bg-surface text-foreground"
              }`}
            >
              {loading && p.id !== "free" && !isCurrent && <Loader2 className="size-3.5 animate-spin" />}
              {label}
            </button>
          </Card>
          );
        })}
      </section>


      <section className="px-6 mt-10">
        <SectionLabel>How upgrading feels here</SectionLabel>
        <Card>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-[14px] leading-relaxed text-foreground/85">
              Premium features are visible everywhere in the app, quietly labeled. Nothing is hidden or dark-patterned. You'll always see <em className="font-serif italic">why</em> a feature helps before we ever ask you to upgrade.
            </p>
          </div>
        </Card>
      </section>

      <section className="px-6 mt-6 pb-10">
        <Link
          to="/marketplace"
          className="flex items-center justify-between rounded-3xl border border-hairline bg-surface p-5"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Also available
            </p>
            <p className="mt-1 font-serif text-xl italic">Family Marketplace</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              One-time templates, itineraries, and installable AI workflows.
            </p>
          </div>
          <span className="text-lg opacity-60">→</span>
        </Link>
      </section>

      <footer className="px-6 pb-10 pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:underline">Refund Policy</Link>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Payments are processed by our reseller Paddle.com, the Merchant of Record for all Family COO orders. Family COO is operated by Aimee Robert.
        </p>
      </footer>
    </AppShell>
  );
}

