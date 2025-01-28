import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except the ones starting with:
  // - api (API routes)
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - node_modules
  // - static files like favicon.ico, robots.txt, ...
  matcher: [
    '/',
    // Match all locale prefixes
    '/(no|en|ar)/:path*',

    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};

