export default defineEventHandler(async (event) => {
  const query = {
    index: "search-termp-a-analytics",
    type: "_search",
    body: {
      query: {
        match_all: {},
      },
      sort: [
        {
          date: {
            order: "desc",
          },
        },
      ],
      size: 1000,
    },
  };

  const esQuery = genEsQuery(query);
  const data = await $fetch(esQuery.url, esQuery.params);

  return data?.hits?.hits;
});
