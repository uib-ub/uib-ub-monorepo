import genConceptQuery from "../../utils/genConceptQuery";
import compactData from "../../utils/compactData";

export default defineEventHandler(async (event) => {
  const url = useRuntimeConfig().public.endpointUrl;
  const body = await readBody(event);
  const query = genConceptQuery(body.base, body.termbase, body.concept);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 7000);

  try {
    const data = await $fetch(url, {
      method: "post",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
      },
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return compactData(data).then((value) => {
      return value["@graph"];
    });
  } catch (e) {
    // console.log(e)
  }
});
