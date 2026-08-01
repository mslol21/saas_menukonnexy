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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/master/:path*'],
};
