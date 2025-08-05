import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const instance = getFusekiInstanceInfo(runtimeConfig);

  try {
    const queryLalo = genLazyLocalesQuery(runtimeConfig.public.base);
    const dataLaLo = await $fetch(instance.url, {
      method: "post",
      body: queryLalo,
      headers: {
        "Content-type": "application/sparql-query",
        Accept: "application/json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    });

    const queryTermbase = genTermbaseMetaQuery(runtimeConfig.public.base);
    const dataTermbase = await $fetch(instance.url, {
      method: "post",
      body: queryTermbase,
      headers: {
        "Content-type": "application/sparql-query",
        Accept: "application/json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    });

    const queryDomain = genDomainQuery(runtimeConfig.public.base);
    const dataDomain = await $fetch(instance.url, {
      method: "post",
      body: queryDomain,
      headers: {
        "Content-type": "application/sparql-query",
        Accept: "application/ld+json",
        Authorization: `Basic ${instance.authHeader}`,
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
  } catch (e) {}
});
