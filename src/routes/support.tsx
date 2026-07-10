import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Mail, MessageCircle, Shield, FileText, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Family COO" },
      {
        name: "description",
        content:
          "Get help with Family COO. Contact support, browse FAQs, and find privacy and account resources.",
      },
      { property: "og:title", content: "Support — Family COO" },
      {
        property: "og:description",
        content: "Contact support and find help resources for Family COO.",
      },
      { property: "og:url", content: "https://familycoo.lovable.app/support" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/support" }],
  }),
  component: SupportPage,
});

const faqs = [
  {
    q: "How do I cancel my subscription?",
    a: "Open Settings → Subscription and tap Manage. You'll keep access through the end of your billing period. If you subscribed through the App Store or Google Play, cancel from your device's subscription settings.",
  },
  {
    q: "Is my family data private?",
    a: "Yes. Your household data is scoped to your account with row-level security, encrypted in transit, and never sold. See our Privacy Policy for full details.",
  },
  {
    q: "Can I add my partner or nanny?",
    a: "Yes — invite additional household members from Settings → Household. Each person signs in with their own account.",
  },
  {
    q: "How does the AI stay accurate?",
    a: "Family COO grounds every AI response in your actual calendar, tasks, and household context. It won't invent facts about your family.",
  },
  {
    q: "How do I delete my account?",
    a: "Email support@familycoo.app from the address on your account and we'll permanently delete your data within 7 days.",
  },
];

function SupportPage() {
  return (
    <AppShell>
      <header className="px-6 pt-10 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Support
        </p>
        <h1 className="mt-1 font-serif text-3xl italic leading-tight">We're here to help.</h1>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
          Most questions are answered below. If you need a human, email us — we typically reply
          within one business day.
        </p>
      </header>

      <section className="px-6 pb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="mailto:support@familycoo.app"
            className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-4 hover:bg-secondary"
          >
            <Mail className="mt-0.5 size-5 text-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-[13px] font-medium">Email support</p>
              <p className="text-[12px] text-muted-foreground">support@familycoo.app</p>
            </div>
          </a>
          <Link
            to="/concierge"
            className="flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-4 hover:bg-secondary"
          >
            <MessageCircle className="mt-0.5 size-5 text-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-[13px] font-medium">Ask the Concierge</p>
              <p className="text-[12px] text-muted-foreground">In-app AI assistance</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Frequently asked
        </p>
        <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer items-center justify-between text-[14px] font-medium">
                <span>{f.q}</span>
                <span className="ml-3 text-muted-foreground group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Resources
        </p>
        <div className="grid gap-2">
          <Link
            to="/privacy-policy"
            className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 hover:bg-secondary"
          >
            <Shield className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[13px]">Privacy Policy</span>
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 hover:bg-secondary"
          >
            <FileText className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[13px]">Terms of Service</span>
          </Link>
          <Link
            to="/refund-policy"
            className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 hover:bg-secondary"
          >
            <LifeBuoy className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[13px]">Refund Policy</span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
