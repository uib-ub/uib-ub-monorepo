import { H3Event } from "h3";

/**
 * Set session cookie when not present or not up to date.
 *
 * @param event H3Event
 */
function ensureToken(event: H3Event) {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: true,
  };
  if (
    !getCookie(event, "session") ||
    getCookie(event, "session") !== useRuntimeConfig().apiKey
  ) {
    setCookie(event, "session", useRuntimeConfig().apiKey, options);
  }
}

/**
 * Ensure cookie and throw error when api is accessed without correct session token.
 */
export default defineEventHandler((event) => {
  ensureToken(event);
  const runtimeConfig = useRuntimeConfig();
  const pathname = getRequestURL(event).pathname;
  if (pathname.startsWith("/api/")) {
    if (getCookie(event, "session") !== runtimeConfig.apiKey) {
      throw createError({
        statusCode: 500, // internally used for retry. ofetch defines list of retry codes statically
        message: "Internal Server Error",
      });
    }
  }
});
