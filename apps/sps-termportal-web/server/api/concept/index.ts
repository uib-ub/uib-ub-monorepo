export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  // Check if event provides api key should be injected by server middleware
  if (event.context.auth === runtimeConfig.apiKey) {
    const url = runtimeConfig.public.endpointUrl;
    const body = await readBody(event);
    const concept =
      body.termbase === "FBK" ? body.base + body.concept : body.concept;
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

      return frameData(data, "skos:Concept").then((result) => {
        delete result["@context"];
        return parseConceptData(result, concept);
      });
    } catch (e) {
      // console.log(e)
    }
  } else {
    return "Access denied."
  }
});
