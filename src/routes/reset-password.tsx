import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Family COO" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => nav({ to: "/" }), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-12">
        <h1 className="font-serif text-3xl italic">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose something you'll remember.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          {done && <p className="text-[13px] text-emerald-700">Updated. Redirecting…</p>}
          <button
            type="submit"
            disabled={busy || done}
            className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
