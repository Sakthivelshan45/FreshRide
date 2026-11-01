import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection is handled server-side in admin pages
  // Auth route protection is handled server-side in account pages
  // The proxy just passes requests through - full auth middleware
  // requires a connected Supabase instance

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images|icons).*)',
  ],
}
