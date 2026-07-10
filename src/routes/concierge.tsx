import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useRef, useState } from "react";
import { Mic, ArrowUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/concierge")({
  head: () => ({
    meta: [
      { title: "AI Concierge — Ask Anything About Your Family | Family COO" },
      {
        name: "description",
        content:
          "Natural-language concierge for your household. Ask about pickups, plans, packing, groceries, or bookings — get answers grounded in your family's context.",
      },
      { property: "og:title", content: "AI Concierge — Family COO" },
      {
        property: "og:description",
        content: "A conversational chief of staff for the family, available anytime.",
      },
      { property: "og:url", content: "https://familycoo.lovable.app/concierge" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/concierge" }],
  }),
  component: ConciergePage,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

const seed: Msg[] = [
  {
    id: "m1",
    role: "ai",
    text: "Good morning, Aimee. I've reviewed today's schedule, weather, and household state. What can I take off your plate?",
  },
];

const suggestions = [
  "Plan next weekend",
  "Book Lily's dentist",
  "Find flights to Japan",
  "Who's picking up Oliver today?",
  "What do we need before tennis season?",
];

function replyFor(q: string): string {
  const l = q.toLowerCase();
  if (l.includes("pick") && l.includes("oliver"))
    return "Basil is picking up Oliver from tennis today. He's set an alarm to leave at 4:15 PM to beat the 5 PM rain. I've notified him.";
  if (l.includes("dentist"))
    return "I can book Dr. Alvarez (Lily's usual). She has openings Tue 3 PM, Thu 9 AM, or Fri 4 PM. Which works? I'll add it to the calendar and remind Sofia.";
  if (l.includes("japan") || l.includes("flight"))
    return "For Tokyo Oct 24 – Nov 3: ANA 007 is your usual (nonstop, sleep pods available). Note: your passport expires within 6 months of the trip — Japan requires 6+ months validity. I've prepared the renewal packet.";
  if (l.includes("weekend"))
    return "Next weekend Basil and Oliver are at the Fall Classic (Fri–Sun). Lily is home with Sofia Saturday morning; Sunday is open. Shall I hold Sunday for family time, or plan a brunch with the Chens?";
  if (l.includes("tennis"))
    return "Before tennis season starts: new grip tape (I've added it), racquet restring due (I can book with Marco), 2 backup snacks for tournaments, sunscreen refill, and hydration pack. Say 'do it' and I'll place the order.";
  return "Working on it — I'll pull that together across your calendar, contacts, and inventory and come back with a proposal.";
}

function ConciergePage() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: trimmed };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: replyFor(trimmed) }]);
      setThinking(false);
    }, 900);
  }

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          AI Concierge
        </p>
        <h1 className="mt-1 font-serif text-3xl italic leading-tight">Ask anything.</h1>
      </header>

      <section className="space-y-4 px-6 pb-6">
        {msgs.map((m) =>
          m.role === "ai" ? (
            <div key={m.id} className="flex gap-3">
              <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-white">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
              </span>
              <p className="max-w-[36ch] text-[15px] leading-relaxed text-foreground">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[32ch] rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-2.5 text-[15px] leading-relaxed text-white">
                {m.text}
              </p>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex gap-3">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-white">
              <Sparkles className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="flex items-center gap-1 py-2">
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {msgs.length <= 1 && (
        <section className="px-6 pb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Try
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] text-foreground/80 hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-24 left-1/2 z-30 w-[calc(100%-32px)] max-w-[488px] -translate-x-1/2 px-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your COO…"
            className="flex-1 bg-transparent py-2 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Voice"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <Mic className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="submit"
            aria-label="Send"
            className="grid size-9 place-items-center rounded-full bg-zinc-900 text-white transition-transform active:scale-95"
          >
            <ArrowUp className="size-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
