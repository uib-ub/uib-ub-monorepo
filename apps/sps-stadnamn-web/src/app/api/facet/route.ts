//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));

  const query = {
    "size": 0,
    "aggs": {
      "adm1": {
        "terms": {
          "field": "adm1.keyword",
          "size": 30
        },
        "aggs": {
          "adm2": {
            "terms": {
              "field": "adm2.keyword",
              "size": 100
            },
            "aggs": {
              "adm3": {
                "terms": {
                  "field": "adm3.keyword",
                  "size": 100
                }
              }
            }
          }
        }
      },
      
    }, 
    "query": { // todo:same filters as in search, except the active facet
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


  const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
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