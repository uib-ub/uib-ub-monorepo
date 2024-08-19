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
          "should": [
            ...clientFacets.adm.filter((value: string) => value.slice(0,6) != "_false").map((value: string) => ({ 
            "bool": {
              "filter": value.split("__").reverse().map((value: string, index: number) => ({
                  
                  "term":  { [`adm${index+1}.keyword`]: value }
              }))
            }
          })),
          // Handle N/A values
          ...clientFacets.adm.filter((value: string) => value.slice(0,6) == "_false").map((value: string) => {
            // Split the value to separate the levels and remove the "_false" prefix
            const levels = value.slice(8).split('__').filter(val => val.length).reverse();
            console.log("LEVELS", levels)
            const mustClauses = levels.map((level, index) => ({
              "term": { [`adm${index+1}.keyword`]: level }
            }));
          
            // The last level index is determined by the number of levels specified
            const lastLevelIndex = levels.length + 1;
          
            return {
              "bool": {
                "must": mustClauses,
                "must_not": [{
                  "exists": { "field": `adm${lastLevelIndex}.keyword` }
                }]
              }
            };
          })
        ],
          "minimum_should_match": 1
        }

      })

    }
  }

  // other facets
  if (Object.keys(serverFacets).length) {
    for (const [key, values] of Object.entries(serverFacets)) {
      const hasFalse = values.includes("_false");
      const hasTrue = values.includes("_true");
      const filteredValues = values.filter(value => value !== "_false" && value !== "_true");

      // Handle nested properties
      if (key.includes('__')) {
        const [base, nested] = key.split('__');
        termFilters.push({
          "nested": {
            "path": base,
            "query": {
              "bool": {
                "should": [
                  ...(hasFalse ? [{"bool": {"must_not": {"exists": {"field": `${base}.${nested}`}}}}] : []),
                  ...(hasTrue ? [{"exists": {"field": `${base}.${nested}`}}] : []),
                  ...(filteredValues.length ? [{"terms": { [`${base}.${nested}`]: filteredValues }}] : [])
                ],
                "minimum_should_match": 1
              }
            }
          }
        });
      } else {
          termFilters.push({
            "bool": {
              "should": [
                ...(hasFalse ? [{"bool": {"must_not": {"exists": {"field": `${key}.keyword`}}}}] : []),
                ...(hasTrue ? [{"exists": {"field": `${key}.keyword`}}] : []),
                ...(filteredValues.length ? [{"terms": { [`${key}.keyword`]: filteredValues }}] : [])
              ],
              "minimum_should_match": 1
            }
          });
      }
    }
  }

  return {termFilters, filteredParams}


}