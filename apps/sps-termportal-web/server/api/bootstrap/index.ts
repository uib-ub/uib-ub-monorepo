export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const credentials = `termportalen_test_read:${runtimeConfig.endpointUrlPass}`;
  const authHeader = Buffer.from(credentials).toString("base64");

  try {
    const queryLalo = genLazyLocalesQuery(runtimeConfig.public.base);
    const dataLaLo = await $fetch(url, {
      method: "post",
      body: queryLalo,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
    });

    const queryTermbase = genTermbaseMetaQuery(runtimeConfig.public.base);
    const dataTermbase = await $fetch(url, {
      method: "post",
      body: queryTermbase,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
    });

    const queryDomain = genDomainQuery(runtimeConfig.public.base);
    const dataDomain = await $fetch(url, {
      method: "post",
      body: queryDomain,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
        Authorization: `Basic ${authHeader}`,
      },
    })
      .then((data) => {
        return frameData(data, "skos:Concept", true);
      })
      .then((data) => {
        delete data["@context"];
        return identifyData(data["@graph"]);
      });

    return {
      lalo: dataLaLo.results.bindings,
      termbase: dataTermbase.results.bindings,
      domain: dataDomain,
    };
  } catch (e) {
  }
});
