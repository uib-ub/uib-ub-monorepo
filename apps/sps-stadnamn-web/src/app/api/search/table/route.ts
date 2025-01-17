export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset || 'search'  // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  // Add sorting from URL parameters
  if (filteredParams.asc) {
    sortArray = filteredParams.asc.split(',').map(field => ({
      [field]: { order: 'asc' }
    }));
  } else if (filteredParams.desc) {
    sortArray = filteredParams.desc.split(',').map(field => ({
      [field]: { order: 'desc' }
    }));
  }

  // Fallback to default sorting if no sort parameters provided
  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

    
  const query: Record<string,any> = {
    "track_total_hits": 5000000,
    "size":  filteredParams.size || 10,
    "from": filteredParams.from || 0,
    ...highlight ? {highlight} : {},
    "sort": [...sortArray, {uuid: {order: 'asc'}}],
    "_source": true
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