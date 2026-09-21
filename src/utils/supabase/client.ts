import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build or when credentials are missing, return a stub client
    // that won't crash but won't connect to anything either
    console.warn('Supabase credentials missing. Using placeholder client.');
    // Use placeholder values that won't crash the @supabase/ssr constructor
    client = createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
    );
    return client;
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
