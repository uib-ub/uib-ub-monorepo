export const runtime = 'edge'
import { extractFacets } from '../_utils/facets'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));
  const {term_filters } = extractFacets(request)
  const dataset = params.dataset == 'search' ? '*' : params.dataset;
  const facets = params.facets?.split(',')

 let aggs;
 if (facets) {
  aggs = {}
  for (let i = facets.length - 1; i >= 0; i--) {
      const facetField = facets[i].split('__');
      const isNestedQuery = facetField.length > 1;

      aggs = isNestedQuery
        ? {
          [facetField[0]]: {
            nested: {
              path: facetField[0],
            },
            aggs: {
              [facetField[1]]: {
                terms: {
                  field: `${facetField.join('.')}`,
                  size: params.facetSearch ? 10 : 50,
                  ...params.facetSort ? { order: { _key: params.facetSort } } : {},
                },
              },
            },
          },
          ...(i < facets.length - 1 ? { aggs } : {})
        }
        : {
            [facets[i]]: {
              terms: {
                field: `${facets[i]}.keyword`,
                size: params.facetSearch ? 10 : 50,
                ...params.facetSort ? { order: { _key: params.facetSort } } : {},
              },
              ...(i < facets.length - 1 ? { aggs } : {})
            }
          };
    }
  }

  
  
  const query = {
    size: 0,
    aggs,
    query: { // todo:same filters as in search, except the active facet
      bool: {
        must: [
          ...params.facetSearch ? [{
            simple_query_string: {
              query: params.facetSearch,
              fields: facets
            }}] : [{ match_all: {} }],
          ...params.q ? [{
            simple_query_string: {
              query: params.q,
              fields: ["label"]
            }}] : [],
        ],
        ...term_filters.length ? {filter: term_filters} : {}
       }
    }
  }

  console.log(JSON.stringify(query, null, 2))



  const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  })

  const data = await res.json()

  return Response.json(data);
}