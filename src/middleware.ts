import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  // If trying to access login or signup page, let them pass.
  // The pages themselves will handle redirecting logged-in users.
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    return NextResponse.next();
  }

  // Define protected paths
  const protectedPaths = [
    '/tunnelvista', 
    '/uservista', 
    '/dashboard', 
    '/devices', 
    '/tunnels', 
    '/logs', 
    '/settings', 
    '/topology', 
    '/vpn', 
    '/configure-vpn'
  ];
  
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  // If accessing a protected page without a session cookie, redirect to login
  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If at root, redirect to login as a default landing page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/auth/login',
    '/auth/signup',
    '/tunnelvista/:path*', 
    '/uservista/:path*', 
    '/dashboard/:path*',
    '/devices/:path*',
    '/tunnels/:path*',
    '/logs/:path*',
    '/settings/:path*',
    '/topology/:path*',
    '/vpn/:path*',
    '/configure-vpn/:path*',
  ],
};
