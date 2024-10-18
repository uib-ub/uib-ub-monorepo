export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

    
  const query: Record<string,any> = {
    "size":  termFilters.length == 0 && !simple_query_string ? 0 : filteredParams.size  || 10,
    ...highlight ? {highlight} : {},
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },
      }
    },
    "fields": ['uuid', 'label', 'location', 'adm1', 'adm2'],
    "sort": sortArray,
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
  
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
  
}