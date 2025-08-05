import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { supabase } from "../lib/supabase";

export const useAuth = () => {
  const {
    user,
    session,
    loading,
    signOut,
    setUser,
    setSession,
    setLoading,
    isEmailVerified,
  } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove dependencies since Zustand functions are stable

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: isEmailVerified(user),
  };
};
