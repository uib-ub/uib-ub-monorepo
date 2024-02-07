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
          lat: params.topLeftLat ? parseFloat(params.topLeftLat) : 0,
          lon: params.topLeftLng ? parseFloat(params.topLeftLng) : 0,
        },
        bottom_right: {
          lat: params.bottomRightLat ? parseFloat(params.bottomRightLat) : 0,
          lon: params.bottomRightLng ? parseFloat(params.bottomRightLng) : 0,
        },
    }}
}

const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": ["label"]
    }} : null


    const term_filters = Object.keys(filters).length > 0 ? {
      ...filters.adm1 ? {"bool": {"should": filters.adm1.map((value: string) => ({ "term":  { "adm1": value }})), 
                                  "minimum_should_match": 1}} : {},
      ...filters.adm2 ? {"bool": {"should": filters.adm2.map((value: string) => ({ "term":  { "adm2.id": value }})), 
                                  "minimum_should_match": 1}} : {},
      ...filters.adm3 ? {"bool": {"should": filters.adm3.map((value: string) => ({ "term":  { "adm3": value }})), 
                                  "minimum_should_match": 1}} : {}
    } : null



if (simple_query_string || term_filters) {
    query.query = {
        "bool": {
            "must": [geo_query],
        }
    }
    if (simple_query_string) {
        query.query.bool.must.push(simple_query_string)
    }
    if (term_filters) {
        query.query.bool.filter = term_filters
    }
}
else {
    query.query = geo_query
}

//console.log("GEO QUERY", JSON.stringify(query))


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