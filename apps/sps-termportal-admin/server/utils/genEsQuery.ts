export default function (query: Record<string, any>) {
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
      body: query.query,
    },
  };

  return esQuery;
}
