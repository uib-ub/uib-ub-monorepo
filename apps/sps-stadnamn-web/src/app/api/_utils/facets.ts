import { datasetTitles, datasetTypes } from "@/config/metadata-config";
import { baseAllConfig } from "@/config/search-config";
import { treeSettings } from "@/config/server-config";
import { base64UrlToString } from "@/lib/utils";

export const RESERVED_PARAMS = [
  'q',
  'display',
  'perspective',
  'datasetTag',
  'page',
  'groupPage',
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
  'facetSearch',
  'totalHits',
  'facets',
  'zoom',
  'point',
  'namesNav',
  'facetQuery',
  'mode'
] as const;

export function extractFacets(request: Request) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const reservedParams: { [key: string]: string } = {};
  const datasets: string[] = []

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};
  const rangeFilters: { [key: string]: { [operator: string]: string } } = {};
  
  if (urlParams.get('datasetTag') == 'deep') {
    // add boost_gt: '3'
    urlParams.set('boost_gt', '3')
  }


  for (const [key, value] of urlParams.entries()) {
    if (RESERVED_PARAMS.includes(key as any)) {
      reservedParams[key] = urlParams.get(key)!;
      if (key == 'datasetTag') {
        if (value == 'tree') {
          datasets.push(...Object.keys(treeSettings))
        }
        else if (value == 'base') {
          datasets.push(...Object.keys(datasetTitles).filter(key => key.endsWith('_g')))
        }
      }
    } else {
      // Check for comparison operators (_gt, _gte, _lt, _lte)
      const comparisonMatch = key.match(/^(.+)_(gt|gte|lt|lte)$/);
      if (comparisonMatch) {
        const [, fieldName, operator] = comparisonMatch;
        if (!rangeFilters[fieldName]) {
          rangeFilters[fieldName] = {};
        }
        rangeFilters[fieldName][operator] = value;
      } 
      else if (value == '_true') {
        termFilters.push({
          "exists": { "field": key }
        });
      }
      else if (value == '_false') {
        termFilters.push({
          "bool": {
            "must_not": { "exists": { "field": key } }
          }
        });
      }
      else {
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
        values.forEach(value => {
          if (!datasets.includes(value)) {
            datasets.push(value);
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
  if (datasets.length) {
    termFilters.push({
      "bool": {
        "should": datasets.map(datasetTag => ({
          "term": {
            "_index": `search-stadnamn-${process.env.SN_ENV}-${datasetTag}`
          }
        })),
        "minimum_should_match": 1
      }
    });
    
  }

  return {termFilters, reservedParams, rangeFilters, datasets}


}