export default defineEventHandler(async (event) => {
  const query = {
    index: "search-termp-a-analytics-visits-tb",
    query: {
      match_all: {},
    },
  };

  const esQuery = genEsQuery(query);
  const data = await $fetch(esQuery.url, esQuery.params);

  return data?.hits?.hits;
});
