import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, RefreshCw, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type InviteResult = { status: string; code?: string; expires_at?: string; max_uses?: number; use_count?: number };
type JoinResult = { status: string; family_name?: string; current_family?: string };

const JOIN_ERRORS: Record<string, string> = {
  invalid: "That code doesn't match any family. Check the letters and try again.",
  expired: "This code has expired. Ask the family organizer for a new one.",
  used_up: "This code has already been used the maximum number of times. Ask for a new one.",
};

export function ConnectButton({ className, label = "Connect" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        }
      >
        <UserPlus className="size-4" strokeWidth={1.75} />
        {label}
      </button>
      <ConnectDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function ConnectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab] = useState<"join" | "invite">("join");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogTitle className="font-serif text-2xl italic">Family Connect</DialogTitle>
        <DialogDescription>Bring your partner, nanny or grandparents into the family.</DialogDescription>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(["join", "invite"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full py-2 text-sm ${tab === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
            >
              {t === "join" ? "Join a family" : "Invite someone"}
            </button>
          ))}
        </div>
        {open && (tab === "join" ? <JoinPane onDone={() => onOpenChange(false)} /> : <InvitePane />)}
      </DialogContent>
    </Dialog>
  );
}

function JoinPane({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<JoinResult | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  const submit = async (leave = false) => {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("join_family", { _code: code, _leave_current: leave });
    setBusy(false);
    if (err) return setError("Something went wrong. Please try again.");
    const r = data as unknown as JoinResult;
    if (r.status === "joined") {
      setConflict(null);
      setJoined(r.family_name ?? "the family");
      qc.invalidateQueries();
    } else if (r.status === "in_other_family") setConflict(r);
    else if (r.status === "already_member") setError(`You're already part of ${r.family_name ?? "this family"}.`);
    else setError(JOIN_ERRORS[r.status] ?? "That code didn't work.");
  };

  if (joined)
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-secondary">
          <Users className="size-5" />
        </div>
        <p className="font-serif text-xl italic">Welcome to {joined}!</p>
        <p className="mt-1 text-sm text-muted-foreground">You now share their calendar, tasks and lists.</p>
        <button onClick={onDone} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
          Done
        </button>
      </div>
    );

  if (conflict)
    return (
      <div className="space-y-3 py-2">
        <p className="text-sm">
          You're currently in <strong>{conflict.current_family}</strong>. To join <strong>{conflict.family_name}</strong>, you'll
          leave your current family. Its information stays with that family.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConflict(null)} className="flex-1 rounded-full border border-hairline py-2.5 text-sm">
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={() => submit(true)}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm text-primary-foreground disabled:opacity-50"
          >
            Leave & join
          </button>
        </div>
      </div>
    );

  return (
    <form
      className="space-y-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim().length === 6) submit(false);
      }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
        placeholder="ABC123"
        inputMode="text"
        autoCapitalize="characters"
        className="w-full rounded-2xl border border-hairline bg-surface px-4 py-4 text-center font-mono text-2xl tracking-[0.4em] focus:outline-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        disabled={busy || code.length !== 6}
        className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Checking…" : "Join family"}
      </button>
    </form>
  );
}

function InvitePane() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["family-invite"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_family_invite");
      if (error) throw error;
      return data as unknown as InviteResult;
    },
  });

  const generate = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("create_family_invite");
    setBusy(false);
    if (error) return toast.error("Couldn't create a code. Try again.");
    qc.setQueryData(["family-invite"], data);
  };

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (q.isLoading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>;
  const inv = q.data;
  if (!inv || inv.status === "not_organizer")
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Only the family organizer can invite new people. Ask them for a code.
      </p>
    );

  if (inv.status !== "ok" || !inv.code)
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">Create a code to share. It works for 7 days.</p>
        <button
          disabled={busy}
          onClick={generate}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create invite code"}
        </button>
      </div>
    );

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface p-3">
        <span className="flex-1 text-center font-mono text-3xl tracking-[0.35em]">{inv.code}</span>
        <button
          onClick={() => copy(inv.code!)}
          aria-label="Copy code"
          className="grid size-10 place-items-center rounded-full bg-secondary"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Expires {new Date(inv.expires_at!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · used{" "}
        {inv.use_count}/{inv.max_uses}
      </p>
      <button
        disabled={busy}
        onClick={generate}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-hairline py-2.5 text-sm disabled:opacity-50"
      >
        <RefreshCw className="size-4" /> New code (old one stops working)
      </button>
    </div>
  );
}
