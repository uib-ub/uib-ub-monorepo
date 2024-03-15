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
      case 'facetSort':
      case 'size':
      case 'topLeftLat':
      case 'topLeftLng':
      case 'bottomRightLat':
      case 'bottomRightLng':
      case 'facetSearch':
      case 'facets':
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
  if (Object.keys(clientFacets).length) {
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
  if (Object.keys(serverFacets).length) {
    for (const [key, values] of Object.entries(serverFacets)) {
      // Handle nested properties
      if (key.includes('__')) {
        const [base, nested] = key.split('__');
        term_filters.push({
          "nested": {
            "path": base,
            "query": {
              "terms": { [`${base}.${nested}.keyword`]: values }
            }
          }
        });
      } else {
        term_filters.push({
          "terms": { [`${key}.keyword`]: values }
        });
      }
    }
  }

  return {term_filters, params}


}