export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const query = genDomainQuery(runtimeConfig.public.base);
  try {
    const data = await $fetch(url, {
      method: "post",
      body: query,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
      },
    });

    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=3600",
    });

    return frameData(data, "skos:Concept", true).then((result) => {
      delete result["@context"];
      return identifyData(result["@graph"]);
    });
  } catch (e) {}
});
