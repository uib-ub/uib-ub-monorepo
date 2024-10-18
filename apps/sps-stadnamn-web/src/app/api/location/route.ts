export const runtime = 'edge'
import { extractFacets } from "../_utils/facets";
import { postQuery } from "../_utils/post";
import { getQueryString } from "../_utils/query-string";
export async function GET(request: Request) {

    const {termFilters, filteredParams} = extractFacets(request)
    const coordinates = filteredParams?.point.split(',')
    if (coordinates.length == 2) {
        
        const { simple_query_string } = getQueryString(filteredParams)


        const query: Record<string,any> = {
            size: 1000,
            _source: false,
            fields: ['uuid', 'label', 'location', 'adm1', 'adm2'],
        }
        
        const distance_query = { geo_distance: {
            distance: '1m',
            location: {
                lat: parseFloat(coordinates[0]),
                lon: parseFloat(coordinates[1])
                }
            }
        }

        query.query = {
            bool: {
                must: [distance_query],
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

        const [data, status] = await postQuery(filteredParams.dataset, query)
        return Response.json(data, { status: status })
    }
  
    else {
        return new Response('INVALID QUERY', { status: 400 })
    }
  
      
}

