import genConceptQuery from "../../utils/genConceptQuery";
import compactData from "../../utils/compactData";

export default defineEventHandler(async (event) => {
  const url = useRuntimeConfig().public.endpointUrl;
  const body = await readBody(event);
  const query = genConceptQuery(body.base, body.termbase, body.concept);

  const data = await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/ld+json",
    },
  });

  return compactData(data);
});
