import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  const supabase = await createClient()
  let error = null

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    error = result.error
  } else if (tokenHash && (type === 'signup' || type === 'email')) {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })
    error = result.error
  } else {
    error = new Error('Invalid confirmation link')
  }

  if (error) {
    return NextResponse.redirect(new URL('/account/login?confirmed=failed', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/account?confirmed=true', requestUrl.origin))
}
