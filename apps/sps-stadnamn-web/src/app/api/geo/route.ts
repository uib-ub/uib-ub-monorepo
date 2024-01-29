//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));

  console.log("GEO PARAMS", params);


  const query = {
    query: {
        bool: {
        must: [
            {
            geo_bounding_box: {
                "location": {
                top_left: {
                    lat: parseFloat(params.topLeftLat), //bounds.getNorthEast().lat,
                    lon: parseFloat(params.topLeftLng) //bounds.getSouthWest().lng
                },
                bottom_right: {
                    lat: parseFloat(params.bottomRightLat), //bounds.getSouthWest().lat,
                    lon: parseFloat(params.bottomRightLng)//bounds.getNorthEast().lng
                }
                }
            }
            },
            {
                simple_query_string: {
                query: params.q,
                fields: ["label"]            
            }
            }
        ]
        }
    }
    }
  
  

  const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${params.dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  })

  const data = await res.json()

  return Response.json(data);
}