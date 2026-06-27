// Environment variables required for Supabase client configuration
// VITE_SUPABASE_URL - your Supabase project URL
// VITE_SUPABASE_ANON_KEY - your Supabase anon/public API key (frontend only)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
