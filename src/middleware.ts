/**
 * Next.js Middleware
 * Handles authentication, RBAC routing guards, and security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/core/auth';

// Protected routes that require authentication
const protectedPaths = ['/account', '/moderator', '/admin'];

// Auth routes (redirect if already logged in)
const authPaths = ['/login', '/register', '/verify', '/reset'];

// Role-based path restrictions
const roleRestrictedPaths: Record<string, string[]> = {
  '/moderator': ['MODERATOR', 'ADMIN'],
  '/admin': ['ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Get session
  const session = await auth();
  const userRole = session?.user?.role;

  // Check if route requires protection
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    for (const [path, allowedRoles] of Object.entries(roleRestrictedPaths)) {
      if (pathname.startsWith(path) && !allowedRoles.includes(userRole || '')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Auth routes - redirect to account if already logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/account/profile', request.url));
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
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
