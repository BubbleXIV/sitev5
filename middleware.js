import { NextResponse } from 'next/server'

export function middleware(request) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if this is the login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }

    // For other admin routes, check for authentication
    const token = request.cookies.get('admin_token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '')

    // In a real implementation, you'd verify the JWT token here
    // For now, we just check if a token exists
    if (!token) {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}