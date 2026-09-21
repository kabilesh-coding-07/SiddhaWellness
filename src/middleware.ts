import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, skip middleware protection
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  const url = request.nextUrl.clone()
  
  if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/doctor'))) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based protection
  if (user) {
    if (url.pathname.startsWith('/doctor') || url.pathname.startsWith('/dashboard')) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        
        const role = profile?.role || user.user_metadata?.role || 'USER'
        
        if (url.pathname.startsWith('/doctor') && role !== 'DOCTOR') {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
        if (url.pathname.startsWith('/dashboard') && role === 'DOCTOR') {
            url.pathname = '/doctor'
            return NextResponse.redirect(url)
        }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
