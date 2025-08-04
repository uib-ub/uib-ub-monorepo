import { genSuggestQuery } from "~/server/utils/genSuggestQuery";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const body = await readBody(event);
  const query = genSuggestQuery(body.searchOptions, runtimeConfig.public.base);
  const instance = getFusekiInstanceInfo(runtimeConfig);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const data: any = await $fetch(instance.url, {
      method: "post",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return data.results.bindings.map((binding: any) => binding.lit.value);
  } catch (e) {}
});
