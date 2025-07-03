import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/', // homepage if it requires auth
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get('adminToken')?.value;
  const agentToken = request.cookies.get('agentToken')?.value;
  const userToken = request.cookies.get('userToken')?.value;

  // Public routes (e.g. login pages)
  const publicRoutes = [
    '/auth/login',
    '/admin/auth/login',
    '/agent/auth/login',
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Agent route protection
  if (pathname.startsWith('/agent')) {
    if (!agentToken) {
      return NextResponse.redirect(new URL('/agent/auth/login', request.url));
    }
    return NextResponse.next();
  }

  // User routes (dashboard, profile, home)
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname === '/'
  ) {
    if (!userToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
