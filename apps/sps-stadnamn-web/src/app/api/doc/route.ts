export const runtime = 'edge'
import { extractFacets } from "../_utils/facets";
import { postQuery } from "../_utils/post";
import { getQueryString } from "../_utils/query-string";
export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).search);

    const dataset = searchParams.get('dataset') || 'search';
    const uuid = searchParams.get('uuid');
    const point = searchParams.get('point')?.split(',');
    
    let query: Record<string,any> = {
        _source: true
    }
    if (uuid) {
        query.size = 1
        query.query = {
                terms: {
                    uuid: [uuid]
                }
        }

    }
    else if (point?.length == 2) {
        
        const {termFilters, filteredParams} = extractFacets(request)
        const { simple_query_string } = getQueryString(filteredParams)

        query.size = 1000
        
        const distance_query = { geo_distance: {
            distance: '10m',
            location: {
                lat: parseFloat(point[0]),
                lon: parseFloat(point[1])
                }
            }
        }

        if (simple_query_string || termFilters.length) {
            query.query = {
                bool: {
                    must: [distance_query],
                }
            }

            if (simple_query_string) {
                query.query.bool.must.push(simple_query_string)
            }
            if (termFilters.length) {
                query.query.bool.filter = termFilters
            }
            
        }
    }
  
    
        if (!query) {
            console.log("MISSING_PARAMETER")
            console.log("QUERY", query)
            console.log("POINT", point)
            console.log("UUID", uuid)
            return new Response('MISSING_PARAMETER', { status: 400 });
        }
  
      const data = await postQuery(dataset, query)


      console.log("QUERY", query)
      console.log("DATA", data)



  return Response.json(data);
}

