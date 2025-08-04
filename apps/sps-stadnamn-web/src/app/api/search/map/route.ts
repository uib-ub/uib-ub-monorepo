export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { fieldConfig, resultConfig } from '@/config/search-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }
    
  const query: Record<string,any> = {
    "track_total_hits": 10000000,
    "size":  0,
      "aggs": {
        "viewport": {
          "geo_bounds": {
            "field": "location",
            "wrap_longitude": true
          },
        },
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