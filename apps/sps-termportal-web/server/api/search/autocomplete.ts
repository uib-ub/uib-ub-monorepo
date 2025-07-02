import { genAutocompleteQuery } from "~/server/utils/genAutocompleteQuery";
import { decodeSearchOptions } from "~/server/utils/genQueryUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;
  const credentials = `termportalen_test_read:${runtimeConfig.endpointUrlPass}`;
  const authHeader = Buffer.from(credentials).toString("base64");
  const queryParams = getQuery(event);
  const searchOptions = decodeSearchOptions(queryParams);
  const query = genAutocompleteQuery(searchOptions, runtimeConfig.public.base);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const data: any = await $fetch(url, {
      method: "post",
      body: query,
      signal: controller.signal,
      headers: new Headers({
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      }),
    }).then((value) => {
      clearTimeout(timer);
      return value;
    });

    return data.results.bindings.map((binding: any) => binding.litstr.value);
  } catch (e) {}
});
