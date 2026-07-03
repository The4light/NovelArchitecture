import { supabase } from '../lib/supabaseClient';

export const authService = {
  // 1. Sign Up a Brand New Writer
  async signup(email, password, penName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          pen_name: penName, // This stores their chosen pen name securely inside user metadata
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // 2. Sign In an Existing Writer
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 3. Log Out / Terminate Session
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};