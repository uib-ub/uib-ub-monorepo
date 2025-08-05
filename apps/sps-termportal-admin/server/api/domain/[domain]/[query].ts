import genExploreDomainTermbasesQuery from "~/server/utils/genExploreDomainTermbasesQuery";
import genExploreDomainTermbasesRecQuery from "~/server/utils/genExploreDomainTermbasesRecQuery";
import genDomainOverviewQuery from "~/server/utils/genDomainOverviewQuery";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const queryParams = getQuery(event);

  const instance = getFusekiInstanceInfo(
    runtimeConfig,
    queryParams?.internal ? "internal" : "default"
  );

  const domain = decodeURI(event.context.params?.domain);
  const queryType = event.context.params?.query;

  // Check escache for certain keys
  const cachedData = await checkEsCache(queryType);
  if (cachedData) {
    return cachedData;
  }

  const query = () => {
    switch (queryType) {
      case "domain_overview":
        return genDomainOverviewQuery();
      case "domain_termbases_direct":
        return genExploreDomainTermbasesQuery(domain);
      case "exploreDomainTermbasesRec":
        return genExploreDomainTermbasesRecQuery(domain);
      default:
        break;
    }
  };

  const data = await $fetch(instance.url, {
    method: "post",
    body: query(),
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
      Authorization: `Basic ${instance.authHeader}`,
    },
  });

  return data?.results?.bindings;
});
