export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { simple_query_string } = getQueryString(reservedParams)
    
  const query: Record<string,any> = {
    "track_total_hits": 10000000,
    "track_scores": false,
    "size":  0,
      "aggs": {
        "viewport": {
          "geo_bounds": {
            "field": "location",
            "wrap_longitude": true
          },
        }
      },
    "_source": false
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