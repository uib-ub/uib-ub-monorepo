import { genSearchAggregateQuery } from "~/server/utils/genSearchAggregateQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const body = await readBody(event);
  const query = genSearchAggregateQuery(body);

  const data = await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
    },
  });
  return data.results.bindings.reduce(
    (o, key) => parseAggregateData(o, key),
    {}
  );
});
