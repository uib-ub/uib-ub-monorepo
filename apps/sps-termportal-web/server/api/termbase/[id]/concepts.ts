import { genEsQuery } from "~/server/utils/elasticSearchUtils";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (event.context.params) {
    const query = {
      index: `search-termp-w-${event.context.params.id}`,
      body: {
        _source: [
          "id",
          `displayLabel.${body.language}.value`,
          `displayLabel.${body.language}.language`,
        ],
        query: { match_all: {} },
        sort: [
          {
            [`displayLabel.${body.language}.value`]: {
              order: body.sortOrder,
              unmapped_type: "keyword",
            },
          },
        ],
        size: 10,
      },
    };

    const esQuery = genEsQuery(query);
    const data = await $fetch(esQuery.url, esQuery.params);

    return data?.hits?.hits;
  }
});
