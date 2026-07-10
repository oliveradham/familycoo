import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Family COO" },
      { name: "description", content: "Sign in or create your Family COO account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) nav({ to: "/" });
  }, [session, loading, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message ?? "Sign-in failed.");
  }

  async function forgotPassword() {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setInfo("Password reset link sent — check your email.");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Family COO
          </p>
          <h1 className="mt-3 font-serif text-4xl italic leading-tight">
            {mode === "signin" ? "Welcome back." : "Let's set up your household."}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your calm command center."
              : "One account. Real briefings, real memory, real quiet."}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => oauth("google")}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-hairline bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-zinc-50"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.5 2.2 2 6.7 2 12.2s4.5 10 10 10c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => oauth("apple")}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
              <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.8-1.7 0-3.2.9-4.1 2.4-1.7 3-.4 7.4 1.3 9.8.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.6-3.9zM14 4.7c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-hairline" /> or email <div className="h-px flex-1 bg-hairline" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          {info && <p className="text-[13px] text-emerald-700">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="underline underline-offset-4">
            {mode === "signin" ? "Create an account" : "I already have an account"}
          </button>
          {mode === "signin" && (
            <button onClick={forgotPassword} className="underline underline-offset-4">
              Forgot password?
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4">Terms</Link>{" "}
          and{" "}
          <Link to="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
