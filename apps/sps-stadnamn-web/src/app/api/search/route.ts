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
    "from": params.page ? (parseInt(params.page) - 1) * parseInt(params.size || '10') : 0,
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


  if (simple_query_string && term_filters.length) {
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
  else if (term_filters.length) {
    query.query = {"bool": {
        "filter": term_filters
      }
    }
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