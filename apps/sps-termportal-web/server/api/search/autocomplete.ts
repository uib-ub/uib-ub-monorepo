import { genAutocompleteQuery } from "~/server/utils/genAutocompleteQuery";
import { decodeSearchOptions } from "~/server/utils/genQueryUtils";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const queryParams = getQuery(event);
  const searchOptions = decodeSearchOptions(queryParams);
  const query = genAutocompleteQuery(searchOptions, runtimeConfig.public.base);
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
      headers: new Headers({
        "Content-type": "application/sparql-query",
        Accept: "application/json",
        Authorization: `Basic ${instance.authHeader}`,
      }),
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return data.results.bindings.map((binding: any) => binding.litstr.value);
  } catch (e) {}
});
