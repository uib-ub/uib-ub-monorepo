import { esCachedQueries } from "~/utils/constants";

export async function checkEsCache(queryType: string, addition?: string) {
  const key = addition ? `${queryType}-${addition}` : queryType;
  if (esCachedQueries.includes(key)) {
    const esPrep = {
      index: "termp-a-keyval",
      query: {
        term: {
          key,
        },
      },
    };
    const esQuery = genEsQuery(esPrep);
    const esdata = await $fetch(esQuery.url, esQuery.params);
    if (esdata?.hits.total.value > 0) {
      return esdata.hits.hits[0]._source.val;
    }
  }
  return null;
}

export function genEsQuery(query: Record<string, any>) {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.elasticsearchUrl;
  const apiKey = runtimeConfig.elasticsearchApiKey;

  const esQuery = {
    url: `${url}/${query.index}/_search`,
    params: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${apiKey}`,
      },
      body: { query: query.query },
    },
  };

  return esQuery;
}
