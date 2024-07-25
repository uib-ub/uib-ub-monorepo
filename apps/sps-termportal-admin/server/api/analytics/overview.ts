import genEsQuery from "~/server/utils/genEsQuery";

export default defineEventHandler(async (event) => {
  const query = {
    index: "termp-a-analytics",
    query: {
      query: {
        match_all: {},
      },
    },
  };

  const esQuery = genEsQuery(query);
  const data = await $fetch(esQuery.url, esQuery.params);

  return data?.hits?.hits;
});
