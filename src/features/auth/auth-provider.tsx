"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  syncMessage: string;
  setSyncMessage: (message: string) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [syncMessage, setSyncMessage] = useState("");
  const updateSyncMessage = useCallback((message: string) => setSyncMessage(message), []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setUser(null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, configured: isSupabaseConfigured, syncMessage, setSyncMessage: updateSyncMessage,
    signIn: async (email, password) => {
      if (!supabase) return "Supabase is not configured yet.";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    signUp: async (email, password) => {
      if (!supabase) return "Supabase is not configured yet.";
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
      return error?.message ?? null;
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      for (const key of ["daylight-goals", "daylight-projects", "daylight-students", "daylight-finances", "daylight-emis", "daylight-events", "daylight-sleep"]) {
        window.localStorage.removeItem(key);
      }
    },
  }), [user, loading, syncMessage, updateSyncMessage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
