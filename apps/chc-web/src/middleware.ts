import createIntlMiddleware from "next-intl/middleware";

export default createIntlMiddleware({
  defaultLocale: "no",
  locales: ["no", "en"],
});

export const config = {
  // Skip all paths that aren't pages that you'd like to internationalize
  /* matcher: ['/((?!api|_next|favicon*|assets).*)'] */
  matcher: ["/((?!api|_next|favicon*|assets|.*\\..*).*)"],
};
