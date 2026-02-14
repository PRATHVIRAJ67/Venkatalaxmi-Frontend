// src/Componenets/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY ;

// This client is used for menu items
export const supabase = createClient(supabaseUrl, supabaseKey);

// Add descriptive comments for clarity
// This Supabase instance is primarily used for fetching menu items
