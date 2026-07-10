import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Family COO" },
      {
        name: "description",
        content:
          "How Oliver Robert Adham collects, uses, and protects personal data in Family COO.",
      },
      { property: "og:title", content: "Privacy Policy — Family COO" },
      {
        property: "og:description",
        content: "Our privacy notice for Family COO users.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Family COO
        </Link>
        <h1 className="mt-6 font-serif text-4xl italic tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: July 10, 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">1. Who we are</h2>
            <p>
              Family COO ("the Service") is operated by <strong>Oliver Robert Adham</strong>.
              Oliver Robert Adham is the <em>data controller</em> for personal data
              processed through the Service and is responsible for how that
              data is collected, used, and protected. This notice explains
              what we do with your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Data we collect</h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>Account data</strong> — name, email, login credentials, plan tier.
              </li>
              <li>
                <strong>Household data you provide</strong> — family member names,
                schedules, tasks, medical notes, school info, travel plans, and
                any other content you enter or import.
              </li>
              <li>
                <strong>Connected-source data</strong> — messages, calendar events,
                and documents you choose to connect (e.g., email, calendar).
              </li>
              <li>
                <strong>Support communications</strong> — messages you send us.
              </li>
              <li>
                <strong>Usage and device data</strong> — pages viewed, actions
                taken, device type, browser, approximate location, IP address,
                and diagnostic logs.
              </li>
              <li>
                <strong>Payment metadata</strong> — subscription status, plan,
                and Paddle customer identifiers. We do not receive or store
                your full card details; those are collected directly by Paddle.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. How we use data</h2>
            <ul className="list-disc pl-6">
              <li>Provide and operate the Service (account creation, features, AI assistance).</li>
              <li>Personalize briefings, suggestions, and household intelligence.</li>
              <li>Process subscriptions and manage entitlements.</li>
              <li>Provide customer support.</li>
              <li>Prevent fraud, abuse, and security incidents.</li>
              <li>Improve product quality and performance.</li>
              <li>Send transactional and, where permitted, marketing communications.</li>
              <li>Meet legal, tax, and accounting obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Legal bases</h2>
            <p>Where applicable law (e.g., UK/EU GDPR) requires a legal basis, we rely on:</p>
            <ul className="list-disc pl-6">
              <li><strong>Contract</strong> — to provide the Service you sign up for.</li>
              <li><strong>Legitimate interests</strong> — to secure, improve, and support the Service.</li>
              <li><strong>Consent</strong> — for optional integrations, marketing emails, and non-essential cookies.</li>
              <li><strong>Legal obligation</strong> — to comply with tax, accounting, and regulatory duties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. AI processing</h2>
            <p>
              Family COO uses AI agents to summarize communications, draft
              messages, and suggest actions. Content you provide may be sent
              to sub-processors that host the underlying models to generate
              these outputs. We do not sell your data, and we do not use
              private household content to train third-party models where a
              provider offers a no-training option.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Sharing and subprocessors</h2>
            <p>We share data with limited categories of recipients:</p>
            <ul className="list-disc pl-6">
              <li>
                <strong>Paddle.com Market Limited</strong> — our Merchant of
                Record. Paddle processes payments, subscription billing,
                currency conversion, tax compliance, invoicing, and related
                customer support. See{" "}
                <a
                  href="https://www.paddle.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Paddle's privacy notice
                </a>
                .
              </li>
              <li>
                <strong>Hosting and infrastructure providers</strong> — cloud
                hosting, databases, and file storage used to run the Service.
              </li>
              <li>
                <strong>AI model providers</strong> — used to generate briefings,
                summaries, and suggestions.
              </li>
              <li>
                <strong>Analytics and error monitoring</strong> — to keep the
                Service reliable.
              </li>
              <li>
                <strong>Professional advisers</strong> — legal, accounting,
                and similar advisers, under confidentiality.
              </li>
              <li>
                <strong>Authorities</strong> — where required by law or valid
                legal process.
              </li>
            </ul>
            <p>We never sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. International transfers</h2>
            <p>
              Personal data may be processed in countries outside your own,
              including outside the UK/EEA. Where required, we rely on
              appropriate safeguards such as Standard Contractual Clauses or
              adequacy decisions to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Retention</h2>
            <p>
              We keep personal data for as long as your account is active and
              as long as needed to provide the Service. When you delete your
              account, we delete or anonymize your personal data within a
              reasonable period, except where we must retain records for
              legal, tax, accounting, or fraud-prevention reasons.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Your rights</h2>
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access the personal data we hold about you;</li>
              <li>Correct inaccurate data;</li>
              <li>Delete your data ("right to erasure");</li>
              <li>Restrict or object to certain processing;</li>
              <li>Port your data to another service;</li>
              <li>Withdraw consent at any time (without affecting past processing);</li>
              <li>Lodge a complaint with your local data-protection authority.</li>
            </ul>
            <p>
              We will respond to verifiable requests within the timeframe
              required by applicable law (generally within one month under
              UK/EU GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. Security</h2>
            <p>
              We use appropriate technical and organizational measures to
              protect personal data, including encryption in transit,
              access controls, and secure infrastructure. No system is
              perfectly secure; if a breach affecting your data occurs, we
              will notify you as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">11. Cookies</h2>
            <p>
              We use strictly necessary cookies for authentication and
              essential functionality, and — with your consent where required
              — analytics cookies to understand how the Service is used. You
              can manage preferences through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">12. Children</h2>
            <p>
              Family COO is designed to help adults coordinate households
              that may include children. Only adults may create accounts.
              Information about children entered by a parent or guardian is
              treated with the same care as other household data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">13. Changes to this notice</h2>
            <p>
              We may update this notice from time to time. Material changes
              will be communicated in-app or by email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">14. Contact</h2>
            <p>
              To exercise your rights or ask a privacy question, contact
              Oliver Robert Adham through the in-app support channel. For
              billing-related privacy questions, please contact Paddle at{" "}
              <a
                href="https://paddle.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                paddle.net
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
          <Link to="/refund-policy" className="hover:underline">Refund Policy</Link>
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
