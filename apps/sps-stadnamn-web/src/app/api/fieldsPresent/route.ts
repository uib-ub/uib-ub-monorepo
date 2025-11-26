//export const runtime = 'edge'

import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { facetConfig } from '@/config/search-config';
import { extractFacets } from '../_utils/facets';

export async function GET(request: Request) {
  const {termFilters, reservedParams, datasets} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'
  const { simple_query_string } = getQueryString(reservedParams)
  
  // Filter facets based on dataset selection (similar to facet-section.tsx logic)
  const availableFacets = perspective == 'all'
    ? facetConfig['all'].filter(f => 
        datasets.length > 0 
          ? f.datasets?.find((d: string) => datasets.includes(d)) 
          : f.key == 'dataset' || (f.datasets?.length && f.datasets?.length > 1)
      )
    : facetConfig[perspective];
    
  // For each available facet, create a filter for existence, and then in each filter bucket, add a sub-aggregation for top 5 values
  const query: Record<string, any> = {
    "track_scores": false,
    "size": 0,
    "aggs": {
      "fields_present": {
        "filters": {
          "filters": availableFacets.reduce((acc, facetItem) => {
            const addKeyword = !(facetItem.type || facetItem.keyword);
            const field = facetItem.key + (addKeyword ? ".keyword" : "");
            acc[field] = { "exists": { "field": field } };
            return acc;
          }, {} as Record<string, any>)
        },
        "aggs": {}
      }
    },
    "_source": false
  };

  // Add sub-aggregations for top 5 values for each filter bucket
  for (const facetItem of availableFacets) {
    const addKeyword = !facetItem.type;
    const field = facetItem.key + (addKeyword ? ".keyword" : "");
    // Each filter bucket gets a sub-aggregation with the same name as the field
    query.aggs.fields_present.aggs[field] = {
      "terms": {
        "field": field,
        "size": 5
      }
    };
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }

  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, {status: status})
  
}