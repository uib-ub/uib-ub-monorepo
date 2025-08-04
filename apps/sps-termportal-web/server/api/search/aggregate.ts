import { genSearchAggregateQuery } from "~/server/utils/genSearchAggregateQuery";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const query = genSearchAggregateQuery(body);
  const instance = getFusekiInstanceInfo();

  const data = await $fetch(instance.url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
      Authorization: `Basic ${instance.authHeader}`,
    },
  });
  return data.results.bindings.reduce(
    (o, key) => parseAggregateData(o, key),
    {}
  );
});
