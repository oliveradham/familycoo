import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { Mail, Calendar, Check, Sparkles, ShieldCheck } from "lucide-react";
import { detectedProfile, detectedActions } from "@/lib/family-data";
import { useServerFn } from "@tanstack/react-start";
import { loadSampleFamily } from "@/lib/sample-data.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Family COO" },
      { name: "description", content: "Set up your family in five quiet steps — connect calendar and email, add household members, and let the AI learn your routine from the last 60 days." },
      { property: "og:title", content: "Set up Family COO" },
      { property: "og:description", content: "Zero-setup onboarding. Connect once, confirm briefly, and your family's AI chief of staff learns the rest." },
      { property: "og:url", content: "https://familycoo.lovable.app/onboarding" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/onboarding" }],
  }),
  component: OnboardingPage,
});

type Step = 0 | 1 | 2 | 3 | 4;

function OnboardingPage() {
  const [step, setStep] = useState<Step>(0);
  const [connected, setConnected] = useState(false);
  const [sampleState, setSampleState] = useState<"idle" | "loading" | "done">("idle");
  const navigate = useNavigate();
  const seed = useServerFn(loadSampleFamily);

  async function handleSample() {
    if (sampleState !== "idle") return;
    setSampleState("loading");
    try {
      await seed();
      setSampleState("done");
      setTimeout(() => navigate({ to: "/" }), 600);
    } catch (e) {
      console.error(e);
      setSampleState("idle");
    }
  }

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Setup · Step {step + 1} of 5
        </p>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-0.5 flex-1 rounded-full ${
                i <= step ? "bg-zinc-900" : "bg-hairline"
              }`}
            />
          ))}
        </div>
      </header>

      {step === 0 && (
        <section className="px-6">
          <h1 className="font-serif text-[38px] italic leading-[1.05] tracking-tight">
            Connect once. <br />
            I'll do the rest.
          </h1>
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            Family COO reads your email and calendar to organize your household — schools,
            deadlines, sports, travel, medical forms, receipts. No spreadsheets, no scanning.
          </p>

          <div className="mt-8 space-y-2">
            <ConnectRow
              icon={<Mail className="size-4" />}
              label="Google · Gmail + Calendar"
              detail="Recommended"
              done={connected}
              onClick={() => setConnected(true)}
            />
            <ConnectRow
              icon={<Calendar className="size-4" />}
              label="Microsoft · Outlook + Calendar"
              detail="Alternative"
              done={false}
              onClick={() => setConnected(true)}
            />
          </div>

          <p className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Read-only. Encrypted end-to-end. Disconnect any time. We only look at
            family-related messages — narrow the scope later.
          </p>

          <NextButton disabled={!connected} onClick={() => setStep(1)}>
            {connected ? "Continue" : "Connect to continue"}
          </NextButton>

          <button
            onClick={handleSample}
            disabled={sampleState !== "idle"}
            className="mt-3 w-full rounded-full border border-hairline bg-surface py-3 text-[12px] uppercase tracking-widest text-foreground/70 hover:bg-secondary/40 disabled:opacity-50"
          >
            {sampleState === "loading"
              ? "Loading sample family…"
              : sampleState === "done"
                ? "Opening your COO…"
                : "Or explore with a sample family"}
          </button>
        </section>
      )}

      {step === 1 && <ScanStep onDone={() => setStep(2)} />}

      {step === 2 && (
        <section className="px-6">
          <h1 className="font-serif text-[34px] italic leading-[1.05] tracking-tight">
            I organized <br />
            your family.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            From 90 days of email and calendar. Confirm or edit — takes 30 seconds.
          </p>

          <div className="mt-6 space-y-3">
            {detectedProfile.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-hairline bg-surface p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-xl italic">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.detail}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {Math.round(p.confidence * 100)}% match
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-hairline bg-secondary/40 px-2 py-1 text-[11px] text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-widest text-white">
                    Looks right
                  </button>
                  <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <NextButton onClick={() => setStep(3)}>Continue</NextButton>
        </section>
      )}

      {step === 3 && (
        <section className="px-6">
          <h1 className="font-serif text-[34px] italic leading-[1.05] tracking-tight">
            {detectedActions.filter((a) => a.kind === "task").length} action items
            <br />
            <span className="text-muted-foreground">already found.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Approve the ones I should track. I'll skip the newsletters.
          </p>

          <div className="mt-6 space-y-2">
            {detectedActions.map((a) => (
              <ActionRow key={a.id} a={a} />
            ))}
          </div>

          <NextButton onClick={() => setStep(4)}>Approve selected</NextButton>
        </section>
      )}

      {step === 4 && (
        <section className="px-6">
          <div className="mt-4 grid size-14 place-items-center rounded-full bg-zinc-900 text-white">
            <Sparkles className="size-5" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 font-serif text-[38px] italic leading-[1.05] tracking-tight">
            You're set.
          </h1>
          <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            I'll send a morning briefing at 7 AM, an afternoon nudge at 3 PM, and an evening
            wrap at 9 PM. Every correction trains your family's private model.
          </p>

          <div className="mt-8 rounded-3xl border border-hairline bg-surface p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              What I'm watching
            </p>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>· School deadlines, forms, tuition, permission slips</li>
              <li>· Sports registrations, practices, tournaments, weather</li>
              <li>· Travel confirmations, passport windows, packing lists</li>
              <li>· Digital grocery receipts and reorder patterns</li>
              <li>· Medical forms, appointments, Rx refills</li>
              <li>· Household bills, renewals, maintenance</li>
            </ul>
          </div>

          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-medium text-white"
          >
            Open Today
          </button>
          <Link
            to="/inbox"
            className="mt-3 block text-center text-[12px] uppercase tracking-widest text-muted-foreground underline underline-offset-4"
          >
            Or review inbox intelligence
          </Link>
        </section>
      )}
    </AppShell>
  );
}

function ConnectRow({
  icon,
  label,
  detail,
  done,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
        done
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-hairline bg-surface hover:bg-secondary/40"
      }`}
    >
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          done ? "bg-white/10 text-white" : "bg-secondary"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-xs ${done ? "text-white/60" : "text-muted-foreground"}`}>
          {done ? "Connected" : detail}
        </p>
      </div>
      {done ? <Check className="size-4" /> : <span className="text-xs opacity-60">→</span>}
    </button>
  );
}

const stages = [
  "Reading last 90 days of email…",
  "Grouping senders by household member…",
  "Extracting deadlines and attachments…",
  "Matching travel and calendar…",
  "Building your family knowledge graph…",
];

function ScanStep({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setI((v) => {
        if (v >= stages.length - 1) {
          clearInterval(t);
          setTimeout(onDone, 800);
          return v;
        }
        return v + 1;
      });
    }, 750);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <section className="px-6">
      <h1 className="font-serif text-[34px] italic leading-[1.05] tracking-tight">
        One moment.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Scanning quietly. Nothing leaves your account.
      </p>
      <div className="mt-8 space-y-3">
        {stages.map((s, idx) => (
          <div key={s} className="flex items-center gap-3">
            <span
              className={`grid size-5 place-items-center rounded-full text-[10px] ${
                idx < i
                  ? "bg-zinc-900 text-white"
                  : idx === i
                    ? "bg-zinc-900 text-white animate-pulse"
                    : "border border-hairline text-muted-foreground"
              }`}
            >
              {idx < i ? <Check className="size-3" strokeWidth={2.5} /> : idx + 1}
            </span>
            <span
              className={`text-sm ${idx <= i ? "text-foreground" : "text-muted-foreground"}`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionRow({ a }: { a: (typeof detectedActions)[number] }) {
  const [state, setState] = useState<"pending" | "approved" | "dismissed">(
    a.kind === "task" ? "approved" : a.kind === "maybe" ? "pending" : "dismissed",
  );
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        state === "approved"
          ? "border-zinc-900 bg-zinc-900 text-white"
          : state === "dismissed"
            ? "border-hairline bg-surface opacity-50"
            : "border-hairline bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{a.title}</p>
          <p
            className={`mt-0.5 text-[11px] ${
              state === "approved" ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            {a.due} · {a.source} · {Math.round(a.confidence * 100)}% confident
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setState("approved")}
            aria-label="Approve"
            className={`grid size-7 place-items-center rounded-full border text-[11px] ${
              state === "approved"
                ? "border-white bg-white text-zinc-900"
                : "border-hairline"
            }`}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setState("dismissed")}
            aria-label="Dismiss"
            className={`grid size-7 place-items-center rounded-full border text-[11px] ${
              state === "dismissed" ? "border-foreground" : "border-hairline"
            }`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function NextButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-10 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-medium text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
