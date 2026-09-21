import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const LIVE_SUPABASE_URL = 'https://xvxeofhkagyqbfxpsqzi.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eGVvZmhrYWd5cWJmeHBzcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzIwODEsImV4cCI6MjA5MDEwODA4MX0.DtIohNwk_q4UWcxmjA0juHieQoTeRvtCyPxNiWMeVL4';

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
