import { datasetTypes } from "@/config/metadata-config";

export const RESERVED_PARAMS = [
  'q',
  'display',
  'dataset',
  'page',
  'asc',
  'desc',
  'fulltext',
  'facetSort',
  'fields',
  'size',
  'from',
  'topLeftLat',
  'topLeftLng',
  'bottomRightLat',
  'bottomRightLng',
  'doc',
  'sourceLabel',
  'sourceDataset',
  'facetSearch',
  'totalHits',
  'facets',
  'zoom',
  'point',
  'datasetTag',
  'docDataset',
  'group'
] as const;

export function extractFacets(request: Request) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const filteredParams: { [key: string]: string } = {};

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};

  for (const [key, value] of urlParams.entries()) {
    if (RESERVED_PARAMS.includes(key as any)) {
      filteredParams[key] = urlParams.get(key)!;
    } else {
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
      if (filteredParams.dataset == 'all') {
        termFilters.push({
          "bool": {
            "should": [{
              "terms": { "_index": matchingDatasets.map(dataset => `search-stadnamn-${process.env.SN_ENV}-${dataset}`) }
            }],
            "minimum_should_match": 1
          }
        });
      } else {
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

      } else if (key == 'indexDataset') {
        termFilters.push({
          "bool": {
            "should": values.map(value => ({
              "term": {
                "_index": `search-stadnamn-${process.env.SN_ENV}-${value}`
              }
            })),
            "minimum_should_match": 1
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