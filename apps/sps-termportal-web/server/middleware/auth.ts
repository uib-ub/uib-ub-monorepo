import { H3Event } from "h3";
import { cookieDefaultOptions } from "~/utils/vars";

/**
 * Set session cookie when not present or not up to date.
 *
 * @param event - H3Event
 */
function ensureToken(event: H3Event) {
  if (
    !getCookie(event, "session") ||
    getCookie(event, "session") !== useRuntimeConfig().apiKey
  ) {
    setCookie(
      event,
      "session",
      useRuntimeConfig().apiKey,
      cookieDefaultOptions
    );
  }
}

/**
 * Ensure cookie and throw error when api is accessed without correct session token.
 */
export default defineEventHandler((event) => {
  ensureToken(event);
  const runtimeConfig = useRuntimeConfig();
  const pathname = getRequestURL(event).pathname;
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/_content/")) {
    if (getCookie(event, "session") !== runtimeConfig.apiKey) {
      throw createError({
        statusCode: 500, // internally used for retry. ofetch defines list of retry codes statically
        message: "Internal Server Error",
      });
    }
  }
});
