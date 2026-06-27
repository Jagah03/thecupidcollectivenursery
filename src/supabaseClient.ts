// Environment variables required for Supabase client configuration
// VITE_SUPABASE_URL - your Supabase project URL
// VITE_SUPABASE_ANON_KEY - your Supabase anon/public API key (frontend only)

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// If required environment variables are missing (e.g., in a Vercel preview build),
// provide a minimal mock client that satisfies the auth API we use. This prevents
// runtime crashes caused by undefined URL/key values while still allowing the
// app to render. When the variables are correctly set, the real Supabase client
// will be created.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getMockClient(): SupabaseClient<any, "public", any> {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  };
  // @ts-ignore – only the auth shape is needed for our usage
  return { auth: mockAuth } as unknown as SupabaseClient<any, "public", any>;
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : getMockClient();
