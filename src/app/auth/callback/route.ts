import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let role = (user.user_metadata?.role as string) || 'USER'
        try {
          const { data: p } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          if (p?.role) {
            role = p.role
          }
        } catch { }
        
        if (role === 'DOCTOR') {
          return NextResponse.redirect(`${origin}/portal`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
