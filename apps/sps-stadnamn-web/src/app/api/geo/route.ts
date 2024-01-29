//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));

  console.log("PARAMS", params);


  const query = {
    query: {
        bool: {
        must: [
            {
            geo_bounding_box: {
                "geometry": {
                top_left: {
                    lat: params.topLeftLat, //bounds.getNorthEast().lat,
                    lon: params.topLeftLng //bounds.getSouthWest().lng
                },
                bottom_right: {
                    lat: params.bottomRightLat, //bounds.getSouthWest().lat,
                    lon: params.bottomRightLng//bounds.getNorthEast().lng
                }
                }
            }
            },
            ...params.q ? [{
                simple_query_string: {
                query: params.q,
                fields: ["name"]            
            }
            }] : []
        ]
        }
    }
    }
  

/*
  const query = {
    "from": params.page || 0,
    "size": 200,
    "query": {
      ...Object.keys(params).length === 1 && 'dataset' in params ? { "match_all": {} } 
      : { 
        ...params.q && {
          "query_string": {
            "query": params.q,
            "default_field": "label"
          }
        }
       }
    }
  }

  */
  

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