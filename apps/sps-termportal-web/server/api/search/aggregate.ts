import { genSearchAggregateQuery } from "~/server/utils/genSearchAggregateQuery";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  const body = await readBody(event);
  const query = genSearchAggregateQuery(body);
  const instance = getFusekiInstanceInfo(runtimeConfig);

  const data = await $fetch(instance.url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Accept: "application/json",
      Authorization: `Basic ${instance.authHeader}`,
    },
  });
  return data.results.bindings.reduce(
    (o, key) => parseAggregateData(o, key),
    {}
  );
});
