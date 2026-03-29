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
        // Retry loop to wait for the Supabase trigger to create the profile
        let profile = null
        for (let i = 0; i < 5; i++) {
          const { data: p } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (p) {
            profile = p
            break
          }
          // Wait 500ms before next retry
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        const role = profile?.role || user.user_metadata?.role || 'USER'
        if (role === 'DOCTOR') {
          return NextResponse.redirect(`${origin}/doctor`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
