import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LIVE_SUPABASE_URL = 'https://xvxeofhkagyqbfxpsqzi.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eGVvZmhrYWd5cWJmeHBzcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzIwODEsImV4cCI6MjA5MDEwODA4MX0.DtIohNwk_q4UWcxmjA0juHieQoTeRvtCyPxNiWMeVL4';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY;

  const url = request.nextUrl.clone();

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Allow access to portal login page freely
  if (url.pathname === '/portal/login') {
    return response;
  }

  // Protect Patient dashboard
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Protect Doctor Portal
  if (!user && (url.pathname.startsWith('/portal') || url.pathname.startsWith('/doctor'))) {
    url.pathname = '/portal/login';
    return NextResponse.redirect(url);
  }

  // Role-based protection for authenticated users
  if (user) {
    if (url.pathname.startsWith('/portal') || url.pathname.startsWith('/dashboard')) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || user.user_metadata?.role || 'USER';

      if (url.pathname.startsWith('/portal') && role !== 'DOCTOR' && role !== 'ADMIN') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
