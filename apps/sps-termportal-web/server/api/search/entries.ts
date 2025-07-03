import { genSearchEntryQuery } from "~/server/utils/genSearchEntryQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  const url = runtimeConfig.endpointUrl;
  const credentials = `termportalen_test_read:${runtimeConfig.endpointUrlPass}`;
  const authHeader = Buffer.from(credentials).toString("base64");
  const body = await readBody(event);
  const query = genSearchEntryQuery(body);

  const data = await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
  });
  return data.results.bindings.map(processBinding);
});
