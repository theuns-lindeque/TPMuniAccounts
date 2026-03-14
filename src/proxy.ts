import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' ||
    pathname === '/login' || 
    pathname === '/seed-user' ||
    pathname.startsWith('/api/users/login') ||
    pathname.startsWith('/api/users/init') || // For seeding if we use an init endpoint
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.') // Static files

  // Payload's own admin path is handled by Payload itself
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Check for the Payload token in cookies
  // Payload uses 'payload-token' as the default cookie name
  const token = request.cookies.get('payload-token')?.value

  if (!token && !isPublicPath) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
