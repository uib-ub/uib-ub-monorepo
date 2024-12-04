export function genEsQuery(query: Record<string, any>) {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.elasticsearchUrl;
  const apiKey = runtimeConfig.elasticsearchApiKey;

  const esQuery = {
    url: `${url}/${query.index}/${query.type}`,
    params: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${apiKey}`,
      },
      body: query.body,
    },
  };

  return esQuery;
}
