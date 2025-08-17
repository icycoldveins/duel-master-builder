import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, skip authentication
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
