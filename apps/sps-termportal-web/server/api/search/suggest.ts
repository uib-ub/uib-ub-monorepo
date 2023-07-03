import { genSuggestQuery } from "~/server/utils/genSuggestQuery";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const body = await readBody(event);
  const query = genSuggestQuery(
    body.searchOptions,
    runtimeConfig.public.base
  );

  console.log(query)
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const data: any = await $fetch(url, {
      method: "post",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
      },
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return data.results.bindings.map((binding: any) => binding.lit.value + " " + binding.sc.value);
  } catch (e) {}
});
