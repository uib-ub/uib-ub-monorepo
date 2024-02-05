//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
  const params = Object.fromEntries(new URLSearchParams(new URL(request.url).search));

  const query = {
    "aggs": {
      "adm1": {
        "terms": {
          "field": "rawData.fylkesNamn.keyword",
          "size": 30
        },
        "aggs": {
          "adm2": {
            "terms": {
              "field": "rawData.kommuneNamn.keyword",
              "size": 100
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