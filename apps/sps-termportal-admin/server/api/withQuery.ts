import { getFusekiInstanceInfo } from "../utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const queryParams = getQuery(event);
  const body = await readBody(event);

  const instance = getFusekiInstanceInfo(
    runtimeConfig,
    queryParams?.internal ? "internal" : "default",
  );

  const data = await $fetch(instance.url, {
    method: "post",
    body: body.query,
    headers: {
      "Content-type": "application/sparql-query",
      "Referer": "termportalen.no", // TODO Referer problem
      "Accept": "application/json",
      "Authorization": `Basic ${instance.authHeader}`,
    },
  });

  return data?.results?.bindings;
});
