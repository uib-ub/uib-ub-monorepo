export default defineNuxtRouteMiddleware((to) => {
  const termbase = to.params.termbase;
  if (typeof termbase !== "string") {
    return;
  }

  // Bootstrap data is the authority on valid termbase IDs
  const bootstrapData = useBootstrapData();
  const ids = bootstrapData.value
    ? Object.keys(bootstrapData.value.termbase)
    : null;
  const canonical = ids
    ? ids.find(id => id.toLowerCase() === termbase.toLowerCase())
    : termbase.toUpperCase();

  if (!canonical) {
    return navigateTo({ path: "/ikke-funnet", query: { termbase } });
  }
  if (canonical === termbase) {
    return;
  }
  return navigateTo(
    {
      path: to.path.replace(
        `/tb/${encodeURIComponent(termbase)}`,
        `/tb/${canonical}`,
      ),
      query: to.query,
      hash: to.hash,
    },
    { redirectCode: 301 },
  );
});
