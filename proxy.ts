import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge proxy for the Provider Console (saas-provider).
 *
 * Uses `provider_access_token` — the role-scoped cookie set exclusively
 * when a PLATFORM_ADMIN role logs in. Customer and tenant sessions are
 * fully isolated and will NOT grant access here.
 *
 * All routes except /login are protected.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = Boolean(
    request.cookies.get('provider_access_token')?.value,
  );

  // Unauthenticated on any protected route → /login
  if (pathname !== '/login' && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already authenticated on /login → dashboard root
  if (pathname === '/login' && authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'],
};
