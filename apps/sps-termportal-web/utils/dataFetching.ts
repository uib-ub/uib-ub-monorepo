import { SearchQueryResponse } from "./vars";

export async function fetchData(
  query: string,
  accept?: string
): Promise<SearchQueryResponse> {
  const runtimeConfig = useRuntimeConfig()
  const url = runtimeConfig.public.endpointUrl;
  return await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Accept: accept || "application/json",
    },
  });
}
