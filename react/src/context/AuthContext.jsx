import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// 1. Create and export the Context directly right here
export const AuthContext = createContext({});

// 2. Export the single Context Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check for active session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen live to auth updates (Google redirect, Sign out, Sign in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
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
    // ⚡ FIX: Always render children so the App routing architecture stays alive, 
    // allowing WritePage to read and handle the "loading" state gracefully!
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};