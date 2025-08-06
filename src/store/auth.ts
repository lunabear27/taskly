import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { authLogger } from "../lib/logger";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  isEmailVerified: (user: User | null) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      set({
        user: data.user as User,
        session: data.session,
        loading: false,
      });
    } else {
      set({ loading: false });
    }

    return { error };
  },

  signUp: async (email: string, password: string) => {
    authLogger.log("Starting signup", { email });
    set({ loading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      authLogger.log("Signup response", { hasData: !!data, hasError: !!error });

      // Don't set user/session immediately after signup
      // User needs to verify email first
      set({ loading: false });

      return { error };
    } catch (error) {
      authLogger.error("Signup caught error", error);
      set({ loading: false });
      return { error };
    }
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: any | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),
  isEmailVerified: (user: User | null) => {
    if (!user) return false;
    return user.email_confirmed_at !== null;
  },
}));
