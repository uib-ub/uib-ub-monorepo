import { getSortArray } from '@/config/server-config';
import { postQuery } from '@/app/api/_utils/post';
import { extractFacets } from '@/app/api/_utils/facets';
import { getQueryString } from '@/app/api/_utils/query-string';


export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }
    
  const query: Record<string,any> = {
    "size": reservedParams.size || 10,
    ...reservedParams.from ? {from: reservedParams.from} : {},
    "query": {
      
      
      "dis_max": {
        "queries": [
          {
            "term": {
              "label": {
                "value": reservedParams.q?.toLowerCase() || "",
                "boost": 10.0
              }
            }
          },
          {
            "prefix": {
              "label": reservedParams.q?.toLowerCase() || ""
            }
          }
        ],
        "tie_breaker": 0.3
      }
        /*
      
      "prefix": {
        "label": reservedParams.q?.toLowerCase() || ""
      }
        */
      
    },
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost", "label", "location", "group.id"],
    "collapse": {
      "field": "group.admId"
    },
    "sort": [
      {"_score": "desc"},
      {"boost": {"order": "desc", "missing": "_last"}}
    ],
    "_source": false
  }


  console.log("QUERY", query)



  


  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, {status: status})
  
}