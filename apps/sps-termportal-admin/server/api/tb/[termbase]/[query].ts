import genExploreDefinitionsQuery from "~/server/utils/genExploreDefinitionsQuery";
import genInsightTermbaseQuery from "~/server/utils/genInsightTermbaseQuery";
import genOverviewQuery from "~/server/utils/genOverviewQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;

  const termbase = event.context.params.termbase;
  const queryType = event.context.params.query;

  const query = () => {
    switch (queryType) {
      case "exploreDefinitions":
        return genExploreDefinitionsQuery(termbase);
      case "overview":
        return genOverviewQuery();
      case "insightTermbase":
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

  setResponseHeaders(event, {
    "Cache-Control": "public, max-age=1200",
  });

  return data;
});
