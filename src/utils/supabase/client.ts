import { createBrowserClient } from '@supabase/ssr'

const LIVE_SUPABASE_URL = 'https://xvxeofhkagyqbfxpsqzi.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eGVvZmhrYWd5cWJmeHBzcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzIwODEsImV4cCI6MjA5MDEwODA4MX0.DtIohNwk_q4UWcxmjA0juHieQoTeRvtCyPxNiWMeVL4';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
}

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
