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
        filters[key].push(value);
    }
  }


  const query = {
    size: 200,
    fields: ["label", "location"],
    _source: false,
    sort: [
        {
        "uuid.keyword": {
            order: "asc"
        }
        }
    ]
}

const geo_query = {geo_bounding_box: {
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
}}

const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": ["label"]
    }} : null


const term_filters = Object.keys(filters).length > 0 ? {
...filters.adm1 ? {"bool": {"should": filters.adm2.map((value: string) => ({ "term":  { "rawData.kommuneNamn.keyword": value }})), 
                          "minimum_should_match": 1}} : {},
...filters.adm2 ? {"bool": {"should": filters.adm2.map((value: string) => ({ "term":  { "rawData.kommuneNamn.keyword": value }})), 
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