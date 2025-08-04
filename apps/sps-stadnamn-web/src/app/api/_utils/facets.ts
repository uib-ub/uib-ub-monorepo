import { datasetTypes } from "@/config/metadata-config";
import { baseAllConfig } from "@/config/search-config";
import { base64UrlToString } from "@/lib/utils";

export const RESERVED_PARAMS = [
  'q',
  'display',
  'perspective',
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
  'fuzzyNav',
  'datasetTag',
  'facetQuery'
] as const;

export function extractFacets(request: Request) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const reservedParams: { [key: string]: string } = {};

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};
  const rangeFilters: { [key: string]: { [operator: string]: string } } = {};

  for (const [key, value] of urlParams.entries()) {
    if (RESERVED_PARAMS.includes(key as any)) {
      reservedParams[key] = urlParams.get(key)!;
    } else {
      // Check for comparison operators (_gt, _gte, _lt, _lte)
      const comparisonMatch = key.match(/^(.+)_(gt|gte|lt|lte)$/);
      if (comparisonMatch) {
        const [, fieldName, operator] = comparisonMatch;
        if (!rangeFilters[fieldName]) {
          rangeFilters[fieldName] = {};
        }
        rangeFilters[fieldName][operator] = value;
      } else {
        const facets = key == 'adm' ? clientFacets : serverFacets;
        if (!facets[key]) {
          facets[key] = [];
        }
        facets[key].push(value);
      }
    }
  }

  // Handle range filters (comparison operators)
  for (const [fieldName, operators] of Object.entries(rangeFilters)) {
    const rangeQuery: { [key: string]: any } = {};
    
    for (const [operator, value] of Object.entries(operators)) {
      rangeQuery[operator] = value;
    }
    
    termFilters.push({
      "range": {
        [fieldName]: rangeQuery
      }
    });
  }

  // Handle dataset tag (non-categorical dataset type) filter for datasets
  if (reservedParams.datasetTag) {
    const datasetTag = reservedParams.datasetTag;
    const matchingDatasets = Object.entries(datasetTypes)
      .filter(([_, types]) => types.includes(datasetTag))
      .map(([dataset]) => dataset);
    
    if (matchingDatasets.length > 0) {
      if (reservedParams.dataset == 'all') {
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

  // Hierarchical facets
  if (Object.keys(clientFacets).length) {
    if (clientFacets.adm) {
      termFilters.push({
        "bool": {
          "should": [
            ...clientFacets.adm.filter((value: string) => value.slice(0,6) != "_false").map((value: string) => ({ 
            "bool": {
              "filter": value.split("__").reverse().map((value: string, index: number) => ({
                  
                  "term":  { [`group.adm${index+1}.keyword`]: value }
              }))
            }
          })),
          // Handle N/A values
          ...clientFacets.adm.filter((value: string) => value.slice(0,6) == "_false").map((value: string) => {
            // Split the value to separate the levels and remove the "_false" prefix
            const levels = value.slice(8).split('__').filter(val => val.length).reverse();
            const mustClauses = levels.map((level, index) => ({
              "term": { [`group.adm${index+1}.keyword`]: level }
            }));
          
            // The last level index is determined by the number of levels specified
            const lastLevelIndex = levels.length + 1;
          
            return {
              "bool": {
                "must": mustClauses,
                "must_not": [{
                  "exists": { "field": `group.adm${lastLevelIndex}.keyword` }
                }]
              }
            };
          })
        ],
          "minimum_should_match": 1
        }

      })

    }

    if (clientFacets.wikiAdm) {
      termFilters.push({
        "bool": {
          "should": clientFacets.wikiAdm.map((value: string) => {
            const parts = value.split('_');
            const qid = parts[0];
            
            // If only QID is provided
            if (parts.length === 1) {
              return {
                "term": { "wikiAdm": qid }
              };
            }
            
            // For concatenated values, extract adm1 and adm2
            const adm1 = parts[1];
            const adm2 = parts[2];
            
            return {
              "bool": {
                "must": [
                  { "term": { "wikiAdm": qid } },
                  { "term": { "adm1.keyword": adm1 } },
                  ...(adm2 ? [{ "term": { "adm2.keyword": adm2 } }] : [])
                ]
              }
            };
          }),
          "minimum_should_match": 1
        }
      });
    }
  }

  // other facets
  if (Object.keys(serverFacets).length) {
    for (const [key, values] of Object.entries(serverFacets)) {
      const hasFalse = values.includes("_false");
      const hasTrue = values.includes("_true");
      const filteredValues = values.filter(value => value !== "_false" && value !== "_true");

      if (key == 'group') {
        termFilters.push({
          "bool": {
            "should": values.map(value => ({
              "term": { "group.id": base64UrlToString(value) }
            })),
            "minimum_should_match": 1
          }
        });
      }


      // Handle nested properties
      else if (key.includes('__')) {
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
                ...(hasFalse ? [{"bool": {"must_not": {"exists": {"field": `${key}${(baseAllConfig[key as keyof typeof baseAllConfig]?.keyword ?? false) ? '' : '.keyword'}`}}}}] : []),
                ...(hasTrue ? [{"exists": {"field": `${key}${(baseAllConfig[key as keyof typeof baseAllConfig]?.keyword ?? false) ? '' : '.keyword'}`}}] : []),
                ...(filteredValues.length ? [{"terms": { [`${key}${(baseAllConfig[key as keyof typeof baseAllConfig]?.keyword ?? false) ? '' : '.keyword'}`]: filteredValues }}] : [])
              ],
              "minimum_should_match": 1
            }
          });
      }
    }
  }

  return {termFilters, reservedParams, rangeFilters}


}