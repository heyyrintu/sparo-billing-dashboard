import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Global kill switch to disable auth (set DISABLE_AUTH=true)
        if (process.env.DISABLE_AUTH === 'true') {
          return true
        }
        // Allow access to auth pages and health check
        if (req.nextUrl.pathname.startsWith('/auth') || 
            req.nextUrl.pathname === '/api/healthz' ||
            req.nextUrl.pathname === '/api/admin/ensure') {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
}
