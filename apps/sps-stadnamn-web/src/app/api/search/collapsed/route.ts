export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { fieldConfig, resultConfig } from '@/config/search-config';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset || 'all'  // == 'search' ? '*' : filteredParams.dataset;
  const sorted = parseInt(filteredParams.size) > 0
  const { highlight, simple_query_string } = getQueryString(filteredParams, sorted)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }
    
  const query: Record<string,any> = {
    "track_total_hits": 10000000,
    "size":  termFilters.length == 0 && !simple_query_string ? 0 : filteredParams.size  || 10,
    ...filteredParams.from ? {from: filteredParams.from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "collapse": {
      "field": "snid.keyword",
      "inner_hits": {
        "name": "gnidu",
        "size": 0,
      }
    },
    "fields": [
      ...dataset == '*' ? new Set(Object.values(resultConfig).flat()) : resultConfig[dataset],
      ...filteredParams.size == '1000' ? Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => key) : []
    ],
    "sort": [ { "_score": "desc" }],
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