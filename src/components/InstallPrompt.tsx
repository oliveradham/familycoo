import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "familycoo.install.dismissed";

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already installed?
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < 7 * 24 * 3600 * 1000) return;
    } catch {}

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setVisible(false);
    setEvt(null);
  };

  if (!visible || !evt) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-40 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 rounded-2xl border border-hairline bg-surface p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
          <Download className="size-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-foreground">Install Family COO</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            Add to your home screen for a faster, full-screen experience.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="rounded-full border border-hairline px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
