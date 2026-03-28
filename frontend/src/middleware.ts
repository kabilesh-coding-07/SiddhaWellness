import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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
    // For real performance, we'd use a custom claim in JWT, 
    // but for now we'll fetch profile if on a sensitive route
    if (url.pathname.startsWith('/doctor') || url.pathname.startsWith('/dashboard')) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        
        const role = profile?.role || 'USER'
        
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
