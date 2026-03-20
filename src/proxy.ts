import { auth } from '@/lib/auth-edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth?: { user?: unknown } | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!(req as { auth?: unknown }).auth;

  const isAuthPage = nextUrl.pathname.startsWith('/login');
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isApiDocs = nextUrl.pathname.startsWith('/api-docs');

  if (isApiRoute || isApiDocs) return NextResponse.next();

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
