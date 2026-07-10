import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Privacy — Family COO" },
      { name: "description", content: "Two-factor authentication, encrypted transit, private AI, and one-tap controls. Your family data, protected." },
    ],
  }),
  component: Page,
});

type Factor = { id: string; friendly_name?: string | null; status: string };

function Page() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function startEnroll() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toLocaleDateString()}`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setEnrolling({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verifyEnroll() {
    if (!enrolling) return;
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
      factorId: enrolling.factorId,
    });
    if (cErr) return toast.error(cErr.message);
    const { error } = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (error) return toast.error(error.message);
    toast.success("Two-factor authentication enabled");
    setEnrolling(null);
    setCode("");
    void refresh();
  }

  async function removeFactor(id: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) return toast.error(error.message);
    toast.success("Factor removed");
    void refresh();
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Security & privacy"
        title="Locked down by default."
        subtitle="Encrypted in transit, isolated per household, and never used to train AI."
      />

      <section className="px-6 mb-8">
        <SectionLabel>Two-factor authentication</SectionLabel>
        <Card>
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Loading…</p>
          ) : verified.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[13px]">Active on this account. Sign-in requires a code from your authenticator app.</p>
              {verified.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl border border-hairline p-3">
                  <div>
                    <p className="text-[13px] font-medium">{f.friendly_name ?? "Authenticator"}</p>
                    <p className="text-[11px] text-muted-foreground">Verified</p>
                  </div>
                  <button
                    onClick={() => removeFactor(f.id)}
                    className="rounded-full border border-hairline px-3 py-1.5 text-[10px] uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : enrolling ? (
            <div className="space-y-4">
              <p className="text-[13px]">Scan this QR code in Google Authenticator, 1Password, or Authy, then enter the 6-digit code.</p>
              <div className="flex items-center justify-center rounded-xl bg-white p-4">
                <img src={enrolling.qr} alt="TOTP QR code" className="h-44 w-44" />
              </div>
              <p className="text-center text-[11px] text-muted-foreground break-all">Or enter secret: {enrolling.secret}</p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="123456"
                className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-center text-[16px] tracking-widest"
              />
              <div className="flex gap-2">
                <button
                  onClick={verifyEnroll}
                  className="flex-1 rounded-full bg-foreground py-2.5 text-[12px] font-medium text-background"
                >
                  Verify & enable
                </button>
                <button
                  onClick={() => {
                    void supabase.auth.mfa.unenroll({ factorId: enrolling.factorId });
                    setEnrolling(null);
                    setCode("");
                  }}
                  className="rounded-full border border-hairline px-4 py-2.5 text-[12px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px]">Add a second sign-in step so a stolen password isn't enough to reach your family's data.</p>
              <button
                onClick={startEnroll}
                className="rounded-full bg-foreground px-4 py-2.5 text-[12px] font-medium text-background"
              >
                Enable two-factor
              </button>
            </div>
          )}
        </Card>
      </section>

      <section className="px-6 mb-8">
        <SectionLabel>What protects your data</SectionLabel>
        <Card>
          <ul className="space-y-3 text-[13px]">
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Passwords never stored in plain text.</span> Hashed with bcrypt at sign-up. Even we can't read them.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Encrypted in transit (TLS 1.3).</span> Every form submission and API call. HSTS enforced.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Breach-password check.</span> Passwords found in known breaches are blocked at sign-up.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Row-level isolation.</span> The database physically refuses to return another household's rows — enforced below the app layer.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Private AI, redacted.</span> The AI Gateway does not train on your data. Sensitive patterns (IDs, tokens, card numbers) are stripped server-side before any prompt is sent.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span>
              <div><span className="font-medium">Session hygiene.</span> Tokens rotate automatically. Sign out anywhere with one tap.</div>
            </li>
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
