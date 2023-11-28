import genExploreDefinitionsQuery from "~/server/utils/genExploreDefinitionsQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;

  const termbase = event.context.params.termbase;
  const queryType = event.context.params.query;
  let query;

  switch (queryType) {
    case "exploreDefinitions":
      query = genExploreDefinitionsQuery(termbase);
      break;
    default:
      break;
  }

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
    "Cache-Control": "public, max-age=1200",
  });

  return data;
});
