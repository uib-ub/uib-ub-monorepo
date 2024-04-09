import { termbaseUriPatterns } from "../../../utils/vars-termbase";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;

  const idArray = decodeURI(event.context.params.id).split("/");
  const termbase = idArray[0];
  const conceptIdArray = idArray.slice(1);
  let base;
  let id: string;
  let uri: string;
  if (!Object.keys(termbaseUriPatterns).includes(termbase)) {
    base = runtimeConfig.public.base;
    id = `${termbase}-3A${conceptIdArray.join("/")}`;
    uri = id;
  } else {
    base = termbaseUriPatterns[termbase][conceptIdArray[0]];
    id = conceptIdArray.slice(1).join("/");
    uri = base + id;
  }

  const query = genConceptQuery(base, termbase, id);

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

    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=3600",
    });

    return frameData(data, "skos:Concept").then((result) => {
      delete result["@context"];
      return parseConceptData(result, uri);
    });
  } catch (e) {
    // console.log(e)
  }
});
