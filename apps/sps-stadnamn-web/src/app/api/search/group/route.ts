export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)



  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }

    
  const query: Record<string,any> = {
    "size":  500,
    "track_scores": true,
    "fields": [
      "group.id", "label", "adm1", "adm2", "uuid", "sosi", "description", "altLabels", "attestations.label", "gnidu", "snid", "location" // Todo: adapt to whether it's used in the search or in the show more
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
    "_source": reservedParams.mode == 'map' ? false : true
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
  
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}