export function extractFacets(request: Request ) {
  const urlParams = new URL(request.url).searchParams;
  
  const term_filters = []
  const params: { [key: string]: string | null } = {};

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};

  for (const [key, value] of urlParams.entries()) {
    switch (key) {
      case 'q':
      case 'dataset':
      case 'page':
      case 'sort':
      case 'size':
        params[key] = urlParams.get(key);
        break;
      default:
        const facets = key == 'adm' ? clientFacets : serverFacets;
        if (!facets[key]) {
          facets[key] = [];
        }
        facets[key].push(value);
    }
  }


  // Hierarchical facet 
  if (Object.keys(clientFacets).length > 0 ) {
    if (clientFacets.adm) {
      term_filters.push({
        "bool": {
          "should": clientFacets.adm.map((value: string) => ({ 
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

  // other facets
  if (Object.keys(serverFacets).length > 0) {
    for (const [key, values] of Object.entries(serverFacets)) {
      term_filters.push({
        "terms": { [`${key}.keyword`]: values }
      })
    }
  }

  console.log("TERM FILTER", term_filters)
  return {term_filters, params}


}