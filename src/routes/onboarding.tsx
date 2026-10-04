import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { Mail, Calendar, Sparkles, ShieldCheck, Users } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { loadSampleFamily } from "@/lib/sample-data.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Family COO" },
      { name: "description", content: "Set up your family in five quiet steps — connect calendar and email, add household members, and let the AI learn your routine from the last 60 days." },
      { property: "og:title", content: "Set up Family COO" },
      { property: "og:description", content: "Zero-setup onboarding. Connect once, confirm briefly, and your family's AI chief of staff learns the rest." },
      { property: "og:url", content: "https://family-coo.com/onboarding" },
    ],
    links: [{ rel: "canonical", href: "https://family-coo.com/onboarding" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const [sampleState, setSampleState] = useState<"idle" | "loading" | "done">("idle");
  const navigate = useNavigate();
  const seed = useServerFn(loadSampleFamily);

  async function handleSample() {
    if (sampleState !== "idle") return;
    setSampleState("loading");
    try {
      await seed();
      setSampleState("done");
      setTimeout(() => navigate({ to: "/" }), 400);
    } catch (e) {
      console.error(e);
      setSampleState("idle");
    }
  }

  return (
    <AppShell>
      <section className="px-6 pt-10">
        <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-5" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-serif text-[38px] italic leading-[1.05] tracking-tight">Welcome home.</h1>
        <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
          Your household starts empty and fills in as you add your family, events, tasks and groceries. Choose how you'd like to begin.
        </p>

        <div className="mt-8 space-y-2">
          <ChoiceRow icon={<Users className="size-4" />} label="Start with my family" detail="Add the people in your household" onClick={() => navigate({ to: "/family" })} />
          <ChoiceRow icon={<Mail className="size-4" />} label="Connect Google Calendar" detail="Bring your events in automatically" onClick={() => navigate({ to: "/integrations", search: { connect: undefined } })} />
          <ChoiceRow icon={<Calendar className="size-4" />} label="Start empty" detail="Go straight to Today" onClick={() => navigate({ to: "/" })} />
        </div>

        <button
          onClick={handleSample}
          disabled={sampleState !== "idle"}
          className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {sampleState === "loading" ? "Loading sample data…" : sampleState === "done" ? "Opening your COO…" : "Load sample data"}
        </button>
        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Sample data adds a demo family you can explore and delete any time. You can also load it later from Settings.
        </p>
      </section>
    </AppShell>
  );
}

function ChoiceRow({ icon, label, detail, onClick }: { icon: React.ReactNode; label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl border border-hairline bg-surface p-4 text-left hover:bg-secondary/40">
      <span className="grid size-10 place-items-center rounded-xl bg-secondary">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="text-xs opacity-60">→</span>
    </button>
  );
}
