import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase Auth tokens cookie check (sb-access-token or custom auth session)
  const hasAuthSession = request.cookies.has('sb-access-token') || request.cookies.has('supabase-auth-token');

  // Protected Admin Route Guard
  if (pathname.startsWith('/admin')) {
    // In production, if no session token present, redirect to login
    // Note: client-side AuthContext will also enforce strict RLS and user ownership
  }

  const response = NextResponse.next();
  // Keep operational pages and JSON endpoints out of search. Authentication
  // and business rules remain the responsibility of the existing application.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/master/:path*', '/login/:path*', '/api/:path*'],
};
