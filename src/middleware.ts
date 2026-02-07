/**
 * Next.js Middleware
 * Handles route protection and security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/core/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Route protection for admin paths
  if (pathname.startsWith('/admin')) {
    const session = await auth();
    
    if (!session?.user) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }

    if (session.user.role !== 'ADMIN') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user is banned or suspended
    if (session.user.status === 'BANNED' || session.user.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/login?error=account_suspended', request.url));
    }
  }

  // Route protection for moderator paths
  if (pathname.startsWith('/moderator')) {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }

    if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user is banned or suspended
    if (session.user.status === 'BANNED' || session.user.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/login?error=account_suspended', request.url));
    }
  }

  // Route protection for account pages
  if (pathname.startsWith('/account')) {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }

    // Check if user is banned
    if (session.user.status === 'BANNED') {
      return NextResponse.redirect(new URL('/login?error=account_banned', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
