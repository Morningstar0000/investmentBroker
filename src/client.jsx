// src/client.jsx
import { createClient } from '@supabase/supabase-js';

console.log('=== Loading Supabase Client ===');
console.log('All env vars:', import.meta.env);

const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_KEY:', supabaseAnonKey ? 'Set (hidden)' : 'Not set');

// If env vars not set, use hardcoded values
const finalSupabaseUrl = supabaseUrl || 'https://cdmulzkdcgbuyjdwgpfz.supabase.co';
const finalSupabaseKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXVsemtkY2didXlqZHdncGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjkxODMsImV4cCI6MjA2ODg0NTE4M30.zLvqHEVwAj-F9u6fAFT_jtb5eupVZRLJWSRLUgpk-x4';

console.log('Using Supabase URL:', finalSupabaseUrl);

export const supabase = createClient(finalSupabaseUrl, finalSupabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${appUrl}/auth/callback`,
    storage: {
      getItem: (key) => {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      },
      setItem: (key, value) => {
        localStorage.setItem(key, value);
        sessionStorage.setItem(key, value);
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    },
    storageKey: 'supabase.auth.token'
  }
});

console.log('Supabase client created successfully');