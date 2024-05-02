export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  let url = runtimeConfig.endpointUrl;

  const query = getQuery(event);
  if (query?.internal) {
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
