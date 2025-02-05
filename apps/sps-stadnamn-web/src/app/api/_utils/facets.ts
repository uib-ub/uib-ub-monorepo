import { datasetTypes } from "@/config/metadata-config";

export function extractFacets(request: Request ) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const filteredParams: { [key: string]: string } = {};

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};

  for (const [key, value] of urlParams.entries()) {
    switch (key) {
      case 'q':
      case 'display': // Remove?
      case 'dataset':
      case 'page':
      case 'asc':
      case 'desc':
      case 'fulltext':
      case 'facetSort':
      case 'size':
      case 'from':
      case 'topLeftLat':
      case 'topLeftLng':
      case 'bottomRightLat':
      case 'bottomRightLng':
      case 'doc': // Excludes children when searching for markers at the same coordinates
      case 'sourceLabel': // Filter sources
      case 'sourceDataset': // Filter sources
      case 'facetSearch':
      case 'totalHits':
      case 'facets':
      case 'zoom':
      case 'point':
      case 'datasetTag':
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

  // Handle dataset tag (non-categorical dataset type) filter for datasets
  if (filteredParams.datasetTag) {
    const datasetTag = filteredParams.datasetTag;
    const matchingDatasets = Object.entries(datasetTypes)
      .filter(([_, types]) => types.includes(datasetTag))
      .map(([dataset]) => dataset);
    
    if (matchingDatasets.length > 0) {
      termFilters.push({
        "bool": {
          "should": [{
            "terms": { "datasets.keyword": matchingDatasets }
          }],
          "minimum_should_match": 1
        }
      });
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