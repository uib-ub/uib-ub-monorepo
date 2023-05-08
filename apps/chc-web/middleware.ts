import createIntlMiddleware from 'next-intl/middleware';
import { i18n } from 'i18n';

export default createIntlMiddleware(i18n);

export const config = {
  // Skip all paths that aren't pages that you'd like to internationalize
  matcher: ['/((?!api|studio|_next|favicon*|assets|samla-records).*)']
};