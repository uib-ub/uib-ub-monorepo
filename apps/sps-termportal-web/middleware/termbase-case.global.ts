export default defineNuxtRouteMiddleware((to) => {
  const termbase = to.params.termbase;
  if (typeof termbase !== "string" || termbase === termbase.toUpperCase()) {
    return;
  }
  return navigateTo(
    {
      path: to.path.replace(
        `/tb/${encodeURIComponent(termbase)}`,
        `/tb/${termbase.toUpperCase()}`,
      ),
      query: to.query,
      hash: to.hash,
    },
    { redirectCode: 301 },
  );
});
