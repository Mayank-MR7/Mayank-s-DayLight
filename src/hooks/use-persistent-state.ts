"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { supabase } from "@/lib/supabase/client";

/** Hydrates client-only state from localStorage and persists subsequent updates. */
export function usePersistentState<T>(key: string, initialValue: T, normalize?: (storedValue: unknown) => T) {
  const { user, configured, setSyncMessage } = useAuth();
  const userId = user?.id ?? null;
  const initialValueRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const [remoteReadyFor, setRemoteReadyFor] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsHydrated(false);
    setRemoteReadyFor(null);
    let localValue = initialValueRef.current;
    if (!configured || userId) {
      try {
        const storedValue = window.localStorage.getItem(key);
        if (storedValue !== null) {
          const parsedValue: unknown = JSON.parse(storedValue);
          localValue = normalize ? normalize(parsedValue) : parsedValue as T;
        }
      } catch {
        // Fall back to initial data if storage is unavailable or malformed.
      }
    }
    setValue(localValue);

    if (configured && userId && supabase) {
      setSyncMessage("Syncing your studio data…");
      void (async () => {
        const { data, error } = await supabase.from("user_app_data").select("value").eq("user_id", userId).eq("state_key", key).maybeSingle();
        if (!active) return;
        if (error) {
          setSyncMessage(`Cloud sync needs setup: ${error.message}`);
          // Keep local edits available, but never upload them after a failed read.
          setIsHydrated(true);
          return;
        }
        if (data) {
          const remoteValue = normalize ? normalize(data.value) : data.value as T;
          setValue(remoteValue);
          try { window.localStorage.setItem(key, JSON.stringify(remoteValue)); } catch { /* Cloud copy remains available. */ }
          setSyncMessage("Cloud sync is on");
        } else {
          const { error: uploadError } = await supabase.from("user_app_data").upsert(
            { user_id: userId, state_key: key, value: localValue },
            { onConflict: "user_id,state_key" },
          );
          if (uploadError) {
            setSyncMessage(`Cloud sync needs setup: ${uploadError.message}`);
            setIsHydrated(true);
            return;
          }
          setSyncMessage("Cloud sync is on");
        }
        if (!active) return;
        setRemoteReadyFor(userId);
        setIsHydrated(true);
      })();
    } else {
      setIsHydrated(true);
    }
    return () => { active = false; };
  }, [key, normalize, userId, configured, setSyncMessage]);

  useEffect(() => {
    if (!isHydrated || (configured && !userId)) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be disabled or full; in-memory updates still work.
    }
  }, [isHydrated, key, value, configured, userId]);

  useEffect(() => {
    if (!isHydrated || !userId || remoteReadyFor !== userId || !supabase) return;
    let active = true;
    void supabase.from("user_app_data").upsert(
      { user_id: userId, state_key: key, value },
      { onConflict: "user_id,state_key" },
    ).then(({ error }) => {
      if (!active) return;
      setSyncMessage(error ? `Cloud sync needs setup: ${error.message}` : "Cloud sync is on");
    });
    return () => { active = false; };
  }, [isHydrated, key, value, userId, remoteReadyFor, setSyncMessage]);

  return [value, setValue] as const;
}
