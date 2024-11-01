import { checkEsCache } from "~/server/utils/elasticSearchUtils";
import genExploreDefinitionsQuery from "~/server/utils/genExploreDefinitionsQuery";
import genInsightTermbaseQuery from "~/server/utils/genInsightTermbaseQuery";
import genOverviewQuery from "~/server/utils/genOverviewQuery";
import genQualitySemanticRelationsQuery from "~/server/utils/genQualitySemanticRelationsQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  let url = runtimeConfig.endpointUrl;
  const queryParams = getQuery(event);

  if (queryParams?.internal) {
    url = runtimeConfig.endpointUrlInternal;
  }

  const termbase = event.context.params?.termbase;
  const queryType = event.context.params?.query;

  // Check escache for certain keys
  const cachedData = await checkEsCache(queryType);
  if (cachedData) {
    return cachedData;
  }

  const query = () => {
    switch (queryType) {
      case "qualitySemanticRelations":
        return genQualitySemanticRelationsQuery(termbase);
      case "exploreDefinitions":
        return genExploreDefinitionsQuery(termbase);
      case "termbase_overview":
        return genOverviewQuery();
      case "termbase_language_coverage":
        return genInsightTermbaseQuery();
      default:
        break;
    }
  };

  const data = await $fetch(url, {
    method: "post",
    body: query(),
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
    },
  });

  return data.value?.results?.bindings;
});
