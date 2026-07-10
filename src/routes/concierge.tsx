import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useEffect, useRef, useState } from "react";
import { Mic, ArrowUp, Sparkles, Brain, Plus, X, Trash2 } from "lucide-react";
import { askConcierge, listConciergeHistory, clearConciergeHistory } from "@/lib/concierge.functions";
import { listMemories, addMemory, deleteMemory } from "@/lib/memory.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/concierge")({
  head: () => ({
    meta: [
      { title: "AI Concierge — Ask Anything About Your Family | Family COO" },
      { name: "description", content: "Natural-language concierge for your household. Ask about pickups, plans, packing, groceries, or bookings — grounded in your family's context." },
      { property: "og:title", content: "AI Concierge — Family COO" },
      { property: "og:description", content: "A conversational chief of staff for the family, available anytime." },
      { property: "og:url", content: "https://familycoo.lovable.app/concierge" },
    ],
    links: [{ rel: "canonical", href: "https://familycoo.lovable.app/concierge" }],
  }),
  component: ConciergePage,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

const seed: Msg[] = [
  { id: "m1", role: "ai", text: "Good morning. I've reviewed today's schedule and open tasks. What can I take off your plate?" },
];

const suggestions = ["What's on today?", "Summarize this week", "What's overdue?", "Draft a note to school", "Plan the weekend"];

// Web Speech API is browser-only; type loosely to avoid TS globals.
type SpeechRec = {
  start: () => void;
  stop: () => void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

function ConciergePage() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askConcierge);
  const loadHistory = useServerFn(listConciergeHistory);
  const clearHistory = useServerFn(clearConciergeHistory);

  useEffect(() => {
    loadHistory({})
      .then((rows) => {
        if (rows && rows.length > 0) {
          setMsgs(
            rows.map((r: { id: string; role: string; content: string }) => ({
              id: r.id,
              role: r.role === "assistant" ? "ai" : "user",
              text: r.content,
            })),
          );
        }
      })
      .catch(() => {});
  }, [loadHistory]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");
    setThinking(true);
    try {
      const history = next
        .filter((m) => m.id !== "m1")
        .map((m) => ({ role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user", content: m.text }));
      const { reply } = await ask({ data: { messages: history } });
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast.error(msg);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: "I couldn't reach the assistant just now. Try again in a moment." }]);
    } finally {
      setThinking(false);
    }
  }

  function toggleVoice() {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome, Safari, or the mobile app.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  async function onClear() {
    if (!confirm("Clear all Concierge chat history?")) return;
    await clearHistory({});
    setMsgs(seed);
    toast.success("History cleared");
  }

  return (
    <AppShell>
      <header className="flex items-start justify-between gap-3 px-6 pt-10 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">AI Concierge</p>
          <h1 className="mt-1 font-serif text-3xl italic leading-tight">Ask anything.</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMemory(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[11px] text-foreground/80 hover:bg-secondary"
          >
            <Brain className="size-3.5" strokeWidth={1.75} /> Memory
          </button>
          <button
            onClick={onClear}
            aria-label="Clear history"
            className="grid size-8 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <section className="space-y-4 px-6 pb-6">
        {msgs.map((m) =>
          m.role === "ai" ? (
            <div key={m.id} className="flex gap-3">
              <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-white">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
              </span>
              <p className="max-w-[36ch] whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[32ch] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-2.5 text-[15px] leading-relaxed text-white">
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
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Try</p>
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
            placeholder={listening ? "Listening…" : "Ask your COO…"}
            className="flex-1 bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            aria-label="Voice"
            onClick={toggleVoice}
            className={`grid size-8 place-items-center rounded-full ${
              listening ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-foreground"
            }`}
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

      {showMemory && <MemoryDrawer onClose={() => setShowMemory(false)} />}
    </AppShell>
  );
}

const CATEGORIES = ["preference", "allergy", "routine", "contact", "logistics", "other"] as const;

function MemoryDrawer({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const list = useServerFn(listMemories);
  const add = useServerFn(addMemory);
  const del = useServerFn(deleteMemory);
  const [fact, setFact] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("preference");

  const { data: memories = [] } = useQuery({
    queryKey: ["memories"],
    queryFn: () => list({}),
  });

  const addMut = useMutation({
    mutationFn: (v: { fact: string; category: (typeof CATEGORIES)[number] }) => add({ data: v }),
    onSuccess: () => {
      setFact("");
      qc.invalidateQueries({ queryKey: ["memories"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-[520px] rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Family memory</p>
            <h2 className="mt-1 font-serif text-2xl italic">Teach the AI</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-secondary">
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (fact.trim().length < 2) return;
            addMut.mutate({ fact, category });
          }}
          className="mb-4 space-y-2 rounded-2xl border border-hairline bg-surface p-3"
        >
          <textarea
            value={fact}
            onChange={(e) => setFact(e.target.value)}
            placeholder="e.g. Mia is allergic to peanuts. Soccer practice is Tue/Thu at 5pm."
            rows={2}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
              className="rounded-lg border border-hairline bg-white px-2 py-1 text-[12px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={addMut.isPending || fact.trim().length < 2}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-[12px] text-white disabled:opacity-50"
            >
              <Plus className="size-3.5" strokeWidth={2} /> Remember
            </button>
          </div>
        </form>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {memories.length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted-foreground">No facts yet. Add the first one above.</p>
          )}
          {memories.map((m: { id: string; category: string; fact: string }) => (
            <div key={m.id} className="flex items-start gap-2 rounded-xl border border-hairline bg-surface p-3">
              <span className="mt-0.5 rounded-full bg-zinc-900/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/70">
                {m.category}
              </span>
              <p className="flex-1 text-[13px] leading-relaxed text-foreground">{m.fact}</p>
              <button
                onClick={() => delMut.mutate(m.id)}
                aria-label="Delete"
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
