import { genSearchQuery } from "~~/server/utils/genSearchQuery";

export default defineEventHandler(async (event) => {
  protectRoute(event)
  const runtimeConfig = useRuntimeConfig();

  const url = runtimeConfig.public.endpointUrl;
  const body = await readBody(event);
  const query = genSearchQuery(body);

  const data = await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
    },
  });
  return data.results.bindings.map(processBinding);
});
