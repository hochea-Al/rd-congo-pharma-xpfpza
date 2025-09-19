import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://njjxfvjfwfabwphbpqop.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qanhmdmpmd2ZhYndwaGJwcW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTU1NDIsImV4cCI6MjA3Mzg5MTU0Mn0.rQHQKUbeiV097hKVrSTpN5TatDwX6W65buhEht5EZMU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
