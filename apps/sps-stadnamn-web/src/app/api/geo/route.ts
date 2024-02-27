//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
    const urlParams = new URL(request.url).searchParams;
    const params: { [key: string]: string | null } = {};
    const filters: { [key: string]: string[] } = {};


  for (const [key, value] of urlParams.entries()) {
    switch (key) {
      case 'q':
      case 'dataset':
      case 'topLeftLat':
      case 'topLeftLng':
      case 'bottomRightLat':
      case 'bottomRightLng':
        params[key] = urlParams.get(key);
        break;
      default:
        if (!filters[key]) {
          filters[key] = [];
        }

        if (key == 'adm2') {
          let key_value = value.split('_');
          if (key_value.length == 2) {
            filters[key].push(key_value[0]);
            break;
          }
        }
        
        filters[key].push(value);
    }
  }


  const query: Record<string,any> = {
    size: 200,
    fields: ["label", "location"],
    _source: false,
    sort: [
        {
        "uuid.keyword": {
            order: "asc"
        }
        }
    ],
}

const geo_query = {geo_bounding_box: {
    location: {
        top_left: {
          lat: params.topLeftLat ? parseFloat(params.topLeftLat) : 90,
          lon: params.topLeftLng ? parseFloat(params.topLeftLng) : -180,
        },
        bottom_right: {
          lat: params.bottomRightLat ? parseFloat(params.bottomRightLat) : -90,
          lon: params.bottomRightLng ? parseFloat(params.bottomRightLng) : 180,
        },
    }}
}

const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": ["label"]
    }} : null


    const term_filters = []
    if (Object.keys(filters).length > 0 ) {
      if (filters.adm) {
        term_filters.push({
          "bool": {
            "should": filters.adm.map((value: string) => ({ 
              "bool": {
                "filter": value.split("_").reverse().map((value: string, index: number) => ({
                    
                    "term":  { [`adm${index+1}.keyword`]: value }
                }))
              }
            })),
            "minimum_should_match": 1
          }
  
        })
  
      }
    }


if (simple_query_string || term_filters.length) {
    query.query = {
        "bool": {
            "must": [geo_query],
        }
    }
    if (simple_query_string) {
        query.query.bool.must.push(simple_query_string)
    }
    if (term_filters.length) {
        query.query.bool.filter = term_filters
    }
}
else {
    query.query = geo_query
}

let res
try {
  res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${params.dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  });

  if (!res.ok) {
    return new Response(`Request failed with status ${res.status}`, { status: res.status });
  }
  } catch (error) {
    return new Response(`Request failed with error: ${error}`, { status: 500 });
  }

  const data = await res?.json()

  return Response.json(data);
}