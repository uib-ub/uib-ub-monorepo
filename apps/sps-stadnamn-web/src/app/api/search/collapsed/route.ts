//export the runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }
  console.log("PARAMS", reservedParams)
  console.log("REQUEST", request.url)
    
  const query: Record<string,any> = {
    "size":  reservedParams.size  || 10,
    ...reservedParams.from ? {from: reservedParams.from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost", "label"],
    "collapse": {
      "field": "group.id",
    },
    
    "sort": reservedParams.datasetTag == 'base' ?
    [{'group.id': "asc"}, {'label.keyword': "asc"}]
    : [
      ...reservedParams.sortPoint ? [{
        _geo_distance: {
          location: reservedParams.sortPoint,
          order: "asc"
        }
      }] : [],
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

  console.log("QUERY", JSON.stringify(query, null, 2))


  
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

  
 

  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}