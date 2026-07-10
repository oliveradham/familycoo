import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Family COO" },
      {
        name: "description",
        content:
          "Terms and conditions for using Family COO, operated by Oliver Robert Adham.",
      },
      { property: "og:title", content: "Terms & Conditions — Family COO" },
      {
        property: "og:description",
        content: "The terms governing your use of Family COO.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Family COO
        </Link>
        <h1 className="mt-6 font-serif text-4xl italic tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: July 10, 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">1. Who we are</h2>
            <p>
              Family COO ("the Service") is operated by <strong>Oliver Robert Adham</strong>{" "}
              ("we", "us", "our"). By using the Service you are entering into an
              agreement with Oliver Robert Adham.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Acceptance of terms</h2>
            <p>
              By creating an account, accessing, or continuing to use the Service,
              you agree to be bound by these Terms & Conditions. If you do not
              agree, please do not use the Service. You confirm that you are of
              legal age in your jurisdiction and, if using the Service on behalf
              of an organization or family, that you are authorized to bind that
              group.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. The service</h2>
            <p>
              Family COO is an AI-assisted family operations product that helps
              households coordinate schedules, tasks, communications, and related
              logistics. Availability, features, and plan tiers may change over
              time. We do not guarantee that the Service will be uninterrupted,
              error-free, or that it will meet every specific requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Acceptable use</h2>
            <p>
              You may use the Service only for lawful, personal or household
              purposes. You agree not to, and not to permit any other person to:
            </p>
            <ul className="list-disc pl-6">
              <li>Use the Service for any unlawful purpose, or in violation of any applicable law, regulation, or third-party right;</li>
              <li>Commit or facilitate fraud, phishing, spam, unsolicited marketing, harassment, threats, hate speech, or impersonation of any person or organization;</li>
              <li>Upload, generate, or transmit content that is illegal, defamatory, obscene, sexually explicit involving minors, or that infringes intellectual property, privacy, or publicity rights;</li>
              <li>Attempt to interfere with the security, availability, or integrity of the Service, including introducing malware, probing or scanning for vulnerabilities, bypassing rate limits or access controls, scraping, or reverse engineering;</li>
              <li>Use the Service to build a competing product, or to resell, sublicense, or redistribute the Service or its outputs without our prior written permission;</li>
              <li>Use the Service to generate deepfakes, non-consensual imagery, weapons or malware instructions, disinformation, or content intended to deceive or harm others;</li>
              <li>Use the Service to make automated decisions with legal or similarly significant effects on individuals (for example, medical, financial, employment, or insurance decisions) without independent human review;</li>
              <li>Share your account credentials, or use another user's account without authorization.</li>
            </ul>
            <p>
              We may investigate suspected violations, remove or restrict
              content, refuse or filter AI outputs, and suspend or terminate
              accounts that violate this section or that pose a security, legal,
              or fraud risk to us, our users, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. AI-generated content</h2>
            <p>
              The Service uses AI agents to draft messages, summaries, suggestions,
              and actions. Outputs may be inaccurate or incomplete and are not a
              substitute for professional legal, medical, financial, or other
              regulated advice. You are responsible for reviewing, verifying, and
              approving any AI-generated content before relying on it or sending
              it to third parties. You must have the necessary rights to any
              content you provide as input, and you may not use the Service to
              generate illegal content, hate speech, harassment, deepfakes,
              impersonation, malware, or content that infringes third-party
              rights. We may remove content, refuse outputs, or suspend accounts
              that violate these rules.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity under your account.
              Provide accurate information and keep it up to date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Intellectual property</h2>
            <p>
              The Service, including its software, design, and branding, is
              owned by Oliver Robert Adham and protected by intellectual property laws.
              We grant you a limited, non-exclusive, non-transferable right to
              use the Service under your selected plan. You retain ownership of
              content you submit and grant us a limited license to host and
              process it solely to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Payments, subscriptions, and taxes</h2>
            <p>
              Our order process is conducted by our online reseller Paddle.com.
              Paddle.com is the Merchant of Record for all our orders. Paddle
              provides all customer service inquiries and handles returns.
            </p>
            <p>
              Payment, billing, currency conversion, tax collection, cancellation,
              and refund mechanics are governed by Paddle's{" "}
              <a
                href="https://www.paddle.com/legal/checkout-buyer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Checkout Buyer Terms
              </a>
              . Subscriptions renew automatically at the end of each billing period
              until canceled. You can manage or cancel your subscription at{" "}
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

          <section>
            <h2 className="text-lg font-semibold">9. Refunds</h2>
            <p>
              See our{" "}
              <Link to="/refund-policy" className="underline">
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. Suspension and termination</h2>
            <p>
              We may suspend or terminate your access for material breach of these
              terms, non-payment, security or fraud risk, or repeated or serious
              policy violations. Upon termination, your right to use the Service
              ends. Where reasonably possible we will offer an export window
              before deleting your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">11. Warranties and liability</h2>
            <p>
              To the fullest extent permitted by law, the Service is provided
              "as is" without warranties of any kind, express or implied,
              including merchantability or fitness for a particular purpose.
              Our aggregate liability for any claim relating to the Service is
              capped at the fees you paid in the 12 months preceding the claim.
              We are not liable for indirect, consequential, or special damages
              (including loss of profits, data, or goodwill). Nothing in these
              terms excludes liability that cannot be excluded by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">12. Indemnity</h2>
            <p>
              You agree to indemnify Oliver Robert Adham against claims arising from
              your content, your unlawful use of the Service, or your breach of
              these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">13. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Material changes will
              be communicated in-app or by email. Continued use after changes
              take effect constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">14. Governing law</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which
              Oliver Robert Adham operates, without regard to conflict-of-law rules.
              Disputes will be resolved in the competent courts of that
              jurisdiction, unless local consumer law provides otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">15. Contact</h2>
            <p>
              Questions about these terms? Contact Oliver Robert Adham through the
              in-app support channel. For billing and refunds, please contact
              Paddle at{" "}
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
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:underline">Refund Policy</Link>
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
