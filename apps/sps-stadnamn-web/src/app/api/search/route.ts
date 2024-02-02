//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));

  //console.log("SEARCH PARAMS", params);


  const query = {
    "from": params.page || 0,
    "size": params.size  || 10,
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        }
      },
    },
    "query": {
      "bool": {
        "must": [
          { "match_all": {} },
          ...params.q ? [{
            "simple_query_string": {
              "query": params.q,
              "fields": ["label"]
            }}] : []

        ]
       }
    }
  }

  //console.log("SEARCH QUERY JSON", JSON.stringify(query))
  

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