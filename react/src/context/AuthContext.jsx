import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { AuthContext } from "./AuthState";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let receivedAuthEvent = false;

    // Check for active session immediately on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted && !receivedAuthEvent) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted && !receivedAuthEvent) {
          setUser(null);
          setLoading(false);
        }
      });

    // Listen live to auth updates (Google redirect, Sign out, Sign in)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        receivedAuthEvent = true;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
