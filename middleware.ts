import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname, searchParams } = url
  
  // Block any NextAuth API routes immediately - return 404
  if (pathname.startsWith('/api/auth/')) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication not available' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Redirect ALL auth-related page paths to dashboard (no authentication)
  if (pathname.startsWith('/auth/')) {
    const dashboardUrl = new URL('/', request.url)
    dashboardUrl.search = '' // Remove all query params
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Handle callbackUrl redirects - redirect to dashboard (no auth)
  // This catches URLs like /?callbackUrl=... or /auth/signin?callbackUrl=...
  if (searchParams.has('callbackUrl')) {
    const dashboardUrl = new URL('/', request.url)
    dashboardUrl.search = '' // Remove all query params
    return NextResponse.redirect(dashboardUrl)
  }
  
  // If accessing root with any auth-related query params, clean them up
  if (pathname === '/' && (searchParams.has('error') || searchParams.has('access_denied'))) {
    const dashboardUrl = new URL('/', request.url)
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Allow all other requests - no authentication required
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes to handle NextAuth blocking
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
