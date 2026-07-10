import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Family COO" },
      {
        name: "description",
        content:
          "Family COO offers a 30-day money-back guarantee. Refunds are processed by Paddle.",
      },
      { property: "og:title", content: "Refund Policy — Family COO" },
      {
        property: "og:description",
        content: "30-day money-back guarantee on Family COO subscriptions.",
      },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Family COO
        </Link>
        <h1 className="mt-6 font-serif text-4xl italic tracking-tight">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: July 10, 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">30-day money-back guarantee</h2>
            <p>
              Family COO, operated by <strong>Aimee Robert</strong>, offers a
              <strong> 30-day money-back guarantee</strong> on paid subscriptions.
              If you are not satisfied with the Service, you can request a full
              refund within 30 days of your original purchase date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">How to request a refund</h2>
            <p>
              Our payments are processed by our online reseller Paddle.com, the
              Merchant of Record for all Family COO orders. To request a refund:
            </p>
            <ol className="list-decimal pl-6">
              <li>
                Go to{" "}
                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  paddle.net
                </a>{" "}
                and look up your order using the email address you used at
                checkout.
              </li>
              <li>Select the transaction and choose "Request a refund".</li>
              <li>
                Alternatively, contact Aimee Robert through the in-app support
                channel and we will help you with the request.
              </li>
            </ol>
            <p>
              Refunds are issued back to the original payment method. Please
              allow a few business days for the refund to appear on your
              statement, depending on your bank or card provider.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Renewals and cancellations</h2>
            <p>
              Subscriptions renew automatically at the end of each billing
              period. You can cancel your subscription at any time from{" "}
              <a
                href="https://paddle.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                paddle.net
              </a>{" "}
              — after canceling, you will retain access until the end of the
              current period, and no further charges will be made.
            </p>
            <p>
              If a renewal charge occurs and you no longer wish to use the
              Service, contact us or Paddle within 30 days of that renewal to
              request a refund under this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Questions</h2>
            <p>
              For refund-related questions, contact Paddle at{" "}
              <a
                href="https://paddle.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                paddle.net
              </a>{" "}
              or reach Aimee Robert through the in-app support channel.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
