export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset || 'all'  // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }


    
  const query: Record<string,any> = {
    "size":  termFilters.length == 0 && !simple_query_string ? 0 : filteredParams.size  || 10,
    ...filteredParams.from ? {from: filteredParams.from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "collapse": {
      "field": "group",
      "inner_hits": {
        "name": "group",
        "size": 0,
      }
    },
    "fields": [ "boost",
      "group", "label", "adm1", "adm2", "uuid", "sosi", "description", "altLabels", "attestations.label", // Todo: adapt to whether it's used in the search or in the show more
    ],
    "sort": [
      {
        _score: "desc"
      },
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],
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

  
  const [data, status] = await postQuery(dataset, query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}