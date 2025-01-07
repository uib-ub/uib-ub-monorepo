export default defineEventHandler(async (event) => {
  const query = {
    index: "search-termp-a-analytics-visits-tb",
    type: "_search",
    body: {
      query: {
        match_all: {},
      },
      sort: [
        {
          date: {
            order: "asc",
          },
        },
      ],
      size: 36,
    },
  };

  const esQuery = genEsQuery(query);
  const data = await $fetch(esQuery.url, esQuery.params);

  return data?.hits?.hits;
});
