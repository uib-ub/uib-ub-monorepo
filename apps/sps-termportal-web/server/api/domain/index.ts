export default defineEventHandler(async (event) => {
  const url = useRuntimeConfig().public.endpointUrl;
  const query = genDomainQuery(useRuntimeConfig().public.base);

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

    return frameData(data, "skos:Concept", true).then((result) => {
      delete result["@context"];
      return identifyData(identifyData(result["@graph"])["DOMENE-3AToppdomene"].narrower);
    });
  } catch (e) {}
});
