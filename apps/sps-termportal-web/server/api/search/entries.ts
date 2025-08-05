import { genSearchEntryQuery } from "~/server/utils/genSearchEntryQuery";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const body = await readBody(event);
  const query = genSearchEntryQuery(body);
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
  return data.results.bindings.map(processBinding);
});
