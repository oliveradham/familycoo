import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Welcome to Family COO Pro" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader eyebrow="Payment" title="You're all set." subtitle="Your plan is active. It may take a few seconds to reflect." />
      <section className="px-6 space-y-4">
        <Card>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" strokeWidth={1.75} />
            <div>
              <p className="font-serif text-lg italic">Thank you.</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                A receipt is on its way to your inbox from our reseller, Paddle.
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-3 text-[12px] font-medium uppercase tracking-widest text-white"
          >
            Return to today
          </Link>
        </Card>
      </section>
    </AppShell>
  );
}
