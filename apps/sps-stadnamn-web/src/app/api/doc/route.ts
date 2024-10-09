export const runtime = 'edge'
import { postQuery } from "../_utils/post";
export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).search);

    const uuid = searchParams.get('uuid');
    const location = searchParams.get('location')?.split(',');
  
      let dataset = searchParams.get('dataset');
      if (!dataset) {
        dataset = '*'
      }

  
      const query = uuid ? {
          size: 1000,
          query: {
              terms: {
                  uuid: [uuid]
              }
          },
      }
        : location?.length ? {
            size: 1000,
            query: {
            bool: {
                filter: {
                geo_distance: {
                    distance: '10m',
                    location: {
                    lat: parseFloat(location[0]),
                    lon: parseFloat(location[1])
                    }
                }
                }
            }
            },
        }
        : null
    
    
    if (!query) {
        return new Response('MISSING_PARAMETER', { status: 400 });
        }
  
      const data = await postQuery(dataset, query)



  return Response.json(data);
}


