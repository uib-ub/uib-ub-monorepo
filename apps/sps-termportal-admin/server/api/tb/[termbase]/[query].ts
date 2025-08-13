import { checkEsCache } from "~/server/utils/elasticSearchUtils";
import genTermbaseDefinitions from "~/server/utils/genTermbaseDefinitions";
import genInsightTermbaseQuery from "~/server/utils/genInsightTermbaseQuery";
import genOverviewQuery from "~/server/utils/genOverviewQuery";
import genTermbaseDefinitionsMissing from "~/server/utils/genTermbaseDefinitionsMissing";
import genQualitySemanticRelationsQuery from "~/server/utils/genQualitySemanticRelationsQuery";
import genTermbaseSubjectValues from "~/server/utils/genTermbaseSubjectValues";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const queryParams = getQuery(event);
  const instance = getFusekiInstanceInfo(
    runtimeConfig,
    queryParams?.internal ? "internal" : "default",
  );

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
      case "termbase_overview":
        return genOverviewQuery();
      case "definitions":
        return genTermbaseDefinitions(termbase);
      case "definitionsMissing":
        return genTermbaseDefinitionsMissing(termbase);
      case "termbase_language_coverage":
        return genInsightTermbaseQuery();
      case "subjectValues":
        return genTermbaseSubjectValues(termbase);
      default:
        break;
    }
  };

  const data = await $fetch(instance.url, {
    method: "post",
    body: query(),
    headers: {
      "Content-type": "application/sparql-query",
      "Accept": "application/json",
      "Authorization": `Basic ${instance.authHeader}`,
    },
  });

  return data?.results?.bindings;
});
