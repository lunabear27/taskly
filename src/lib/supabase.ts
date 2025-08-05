import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development, provide fallback values if env vars are missing
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-key";

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Log configuration status
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
} else {
  console.log("✅ Supabase client configured successfully");
}

export default supabase;
