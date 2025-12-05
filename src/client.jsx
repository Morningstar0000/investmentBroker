
// src/client.jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cdmulzkdcgbuyjdwgpfz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXVsemtkY2didXlqZHdncGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjkxODMsImV4cCI6MjA2ODg0NTE4M30.zLvqHEVwAj-F9u6fAFT_jtb5eupVZRLJWSRLUgpk-x4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});






