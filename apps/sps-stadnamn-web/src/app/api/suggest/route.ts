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
    "size": 10,
    "query": {
      "prefix": {
        "label.keyword": reservedParams.q?.toLowerCase() || ""
      }
    },
    "collapse": {
      "field": "group.id"
    },
    "_source": ["label", "group.id"],  // Add any other fields you need
    "sort": [
      {"_score": "desc"},
      {"boost": {"order": "desc", "missing": "_last"}}
    ]
  }


  console.log("QUERY", query)



  


  // Only cache if no search string an no filters
  const [data, status] = await postQuery('ssr', query)
  return Response.json(data, {status: status})
  
}