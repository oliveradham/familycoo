import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { initSentry, setSentryUser } from "./sentry";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let settled = false;

    const finish = (nextSession: Session | null) => {
      if (!mounted) return;
      settled = true;
      setSession(nextSession);
      setLoading(false);
      setSentryUser(nextSession?.user?.id ?? null);
    };

    initSentry();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      finish(s);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => finish(data.session))
      .catch(() => finish(null));

    const fallback = window.setTimeout(() => {
      if (!settled) finish(null);
    }, 2500);

    return () => {
      mounted = false;
      window.clearTimeout(fallback);
      sub.subscription.unsubscribe();
    };
  }, []);


  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
