export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const query = genLazyLocalesQuery(runtimeConfig.public.base);
  try {
    const data = await $fetch(url, {
      method: "post",
      body: query,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
      },
    });

    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=3600",
    });

    return data.results.bindings;
  } catch (e) {
  }
});
