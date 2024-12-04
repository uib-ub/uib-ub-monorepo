import { genEsQuery } from "~/server/utils/elasticSearchUtils";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (event.context.params) {
    const query = {
      index: `search-termp-w-${event.context.params.id}`,
      type: "_search",
      body: {
        size: 0,
        aggs: {
          unique_values: {
            terms: {
              field: `displayLabel.${body.language}.firstChar`,
              size: 100,
              order: { _key: "asc" },
            },
          },
          total_count: {
            value_count: {
              field: "id",
            },
          },
        },
      },
    };

    const esQuery = genEsQuery(query);
    const data = await $fetch(esQuery.url, esQuery.params);

    return data?.aggregations;
  }
});
