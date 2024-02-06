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
      case 'page':
      case 'size':
        params[key] = urlParams.get(key);
        break;
      default:
        if (!filters[key]) {
          filters[key] = [];
        }
        filters[key].push(value);
    }
  }

  const query: Record<string,any> = {
    "from": params.page || 0,
    "size": params.size  || 10,
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },

      }
    }
  }

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


  if (simple_query_string && term_filters) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "filter": term_filters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (term_filters) {
    query.query = term_filters
  }



  console.log("SEARCH QUERY", JSON.stringify(query))


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