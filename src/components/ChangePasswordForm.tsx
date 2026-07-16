import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: "err", text: "Passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      setMsg({ kind: "ok", text: "Password updated." });
      setNext("");
      setConfirm("");
      setTimeout(() => setOpen(false), 800);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Could not update password" });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 py-2 text-left text-[14px] text-foreground"
      >
        Change password
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 py-2">
      <input
        type="password"
        autoComplete="new-password"
        placeholder="New password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[14px]"
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-[14px]"
      />
      {msg && (
        <p
          className={
            msg.kind === "ok"
              ? "text-[12px] text-emerald-700"
              : "text-[12px] text-red-700"
          }
        >
          {msg.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-zinc-900 px-4 py-2 text-[12px] font-medium uppercase tracking-widest text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Update password"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMsg(null);
            setNext("");
            setConfirm("");
          }}
          className="rounded-full border border-hairline bg-white px-4 py-2 text-[12px] font-medium uppercase tracking-widest text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
