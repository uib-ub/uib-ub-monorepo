export const runtime = 'edge'
import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));
  const { termFilters, filteredParams } = extractFacets(request)
  const dataset = params.dataset// == 'search' ? '*' : params.dataset;
  const { simple_query_string } = getQueryString(filteredParams)

  const facets = ["image", "audio", "location", "cadastre"]

 let aggs: Record<string,any>;
 if (facets) {
  aggs = {}
  for (let i = facets.length - 1; i >= 0; i--) {
      const facetField = facets[i];


      aggs[facets[i]] = {
              terms: {
                field: `${facets[i]}.keyword`,
                missing: "_false",
                size: params.facetSearch ? 10 : 50,
                ...params.facetSort ? { order: { _key: params.facetSort } } : {},
              },
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
          ...params.q ? [simple_query_string] : [],
        ],
        ...termFilters.length ? {filter: termFilters} : {}
       }
    }
  }

  const data = await postQuery(dataset, query)

  return Response.json(data);
}