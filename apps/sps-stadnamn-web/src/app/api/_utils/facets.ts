export function extractFacets(request: Request ) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const filteredParams: { [key: string]: string } = {};

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};

  for (const [key, value] of urlParams.entries()) {
    switch (key) {
      case 'q':
      case 'display': // Display mode. For now table is the only possible value. Map is default
      case 'dataset':
      case 'page':
      case 'asc':
      case 'desc':
      case 'field':
      case 'facetSort':
      case 'size':
      case 'topLeftLat':
      case 'topLeftLng':
      case 'bottomRightLat':
      case 'bottomRightLng':
      case 'facetSearch':
      case 'facets':
        filteredParams[key] = urlParams.get(key)!;
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
      termFilters.push({
        "bool": {
          "should": clientFacets.adm.map((value: string) => ({ 
            "bool": {
              "filter": value.split("__").reverse().map((value: string, index: number) => ({
                  
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
        termFilters.push({
          "nested": {
            "path": base,
            "query": {
              "terms": { [`${base}.${nested}`]: values }
            }
          }
        });
      } else {
        termFilters.push({
          "terms": { [`${key}.keyword`]: values }
        });
      }
    }
  }

  return {termFilters, filteredParams}


}