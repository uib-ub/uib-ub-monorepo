import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const appConfig = useAppConfig();
  const runtimeConfig = useRuntimeConfig();
  const instance = getFusekiInstanceInfo(runtimeConfig);

  const termbaseId = event.context.params.id;
  const conceptIdArray = decodeURI(event.context.params.conceptid).split("/");

  let base;
  let id: string;
  let uri: string;
  // FBK has subcollections that are part of the uri.

  if (
    (appConfig.tb.base.specialUriTbs as readonly TermbaseId[]).includes(
      termbaseId
    )
  ) {
    const tbId = termbaseId as SpecialUriTermbase & ConfiguredTermbase;
    type PatternKey = keyof (typeof appConfig.tb)[typeof tbId]["uriPatterns"];

    base = appConfig.tb[tbId].uriPatterns[conceptIdArray[0] as PatternKey];
    id = conceptIdArray.slice(1).join("/");
    uri = base + id;
  } else {
    base = runtimeConfig.public.base;
    id = `${termbaseId}-3A${conceptIdArray.join("/")}`;
    uri = id;
  }

  const query = genConceptQuery(base, termbaseId, id);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 7000);

  try {
    const data = await $fetch(instance.url, {
      method: "post",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return frameData(data, "skos:Concept").then((result) => {
      delete result["@context"];
      return parseConceptData(result, uri);
    });
  } catch (e) {}
});
