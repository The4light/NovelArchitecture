import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let handled = false;

    const finish = (session) => {
      if (handled) return;
      handled = true;
      subscription?.unsubscribe();
      navigate(session ? '/write' : '/auth', { replace: true });
    };

    // Listen for the real event Supabase fires once it finishes
    // exchanging the code/token from the URL.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          finish(session);
        }
      }
    );

    // Also check immediately in case the session was already
    // resolved before this component mounted.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish(session);
    });

    // Only give up after a real timeout — not on INITIAL_SESSION.
    const timeout = setTimeout(() => finish(null), 6000);

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 animate-pulse">
        Securing Author Session...
      </p>
    </div>
  );
};

export default AuthCallback;