import genExploreDomainTermbasesQuery from "~/server/utils/genExploreDomainTermbasesQuery";
import genExploreDomainTermbasesRecQuery from "~/server/utils/genExploreDomainTermbasesRecQuery";
import genDomainOverviewQuery from "~/server/utils/genDomainOverviewQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  let url = runtimeConfig.endpointUrl;
  const queryParams = getQuery(event);

  if (queryParams?.internal) {
    url = runtimeConfig.endpointUrlInternal;
  }

  const domain = decodeURI(event.context.params?.domain);
  const queryType = event.context.params?.query;

  const query = () => {
    switch (queryType) {
      case "domainOverview":
        return genDomainOverviewQuery();
      case "exploreDomainTermbases":
        return genExploreDomainTermbasesQuery(domain);
      case "exploreDomainTermbasesRec":
        return genExploreDomainTermbasesRecQuery(domain);
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

  return data;
});
