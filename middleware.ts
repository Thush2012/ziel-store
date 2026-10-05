import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Protect /admin routes
  if (url.pathname.startsWith('/admin')) {
    // Check secure admin session cookie
    const adminSession = req.cookies.get('ziel_admin_token')?.value;

    // If accessing login endpoint or cookie is valid, pass through
    if (!adminSession && !url.pathname.endsWith('/admin/login')) {
      // You can redirect unauthorized users to the home page or a login gate
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
