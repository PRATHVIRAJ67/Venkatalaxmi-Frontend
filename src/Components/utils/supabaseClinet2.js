import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_USER_SUPABASE_URL ;
const supabaseKey = import.meta.env.VITE_USER_SUPABASE_KEY ;

// This client is used for user data operations
export const userSupabase = createClient(supabaseUrl, supabaseKey);

// For backward compatibility, maintain the original export name
export const newsupabase = userSupabase;