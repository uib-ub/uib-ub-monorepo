import { genSearchQuery } from "~~/server/utils/genSearchQuery";

export default defineEventHandler(async (event) => {
  const url = useRuntimeConfig().public.endpointUrl;
  const body = await readBody(event);
  const query = genSearchQuery(
    body.searchOptions,
    "entries",
    body.matching,
    body.situation
  );
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
