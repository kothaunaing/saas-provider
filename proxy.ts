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

  // Never intercept API routes or Next.js static assets
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const authenticated = Boolean(
    request.cookies.get('provider_access_token')?.value,
  );

  // Unauthenticated on any protected route → /login
  if (pathname !== '/login' && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.svg|favicon.ico).*)'],
};
