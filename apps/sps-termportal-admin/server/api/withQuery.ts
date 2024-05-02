export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const queryParams = getQuery(event);
  const body = await readBody(event);
  let url = runtimeConfig.endpointUrl;

  if (queryParams?.internal) {
    url = runtimeConfig.endpointUrlInternal;
  }

  const data = await $fetch(url, {
    method: "post",
    body: body.query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
    },
  });

  return data?.results?.bindings;
});
