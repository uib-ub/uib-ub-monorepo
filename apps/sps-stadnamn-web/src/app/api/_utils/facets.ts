import { datasetTitles } from "@/config/metadata-config";
import { baseAllConfig } from "@/config/search-config";
import { treeSettings } from "@/config/server-config";
import { base64UrlToString } from "@/lib/param-utils";
import { isServerAllowedSearchParamKey } from "@/lib/reserved-param-types";
import type { ServerAllowedParams } from "@/lib/reserved-param-types";

export function extractFacets(request: Request) {
  const urlParams = new URL(request.url).searchParams;

  const termFilters = []
  const reservedParams: ServerAllowedParams = {};
  const datasets: string[] = []

  const clientFacets: { [key: string]: string[] } = {};
  const serverFacets: { [key: string]: string[] } = {};
  const rangeFilters: { [key: string]: { [operator: string]: string } } = {};

  const isHierarchicalAdmFacet = (key: string) => key === 'adm' || key === 'group.adm';

  if (urlParams.get('datasetTag') == 'deep') {
    // add boost_gt: '3'
    urlParams.set('boost_gt', '3')
    urlParams.set('boost_lt', '20')
  }

  // Tree mode (register) is controlled solely by `tree`.
  // When `tree` is present and no specific dataset filter is set, search across cadastral datasets.
  if (urlParams.get('tree') && !urlParams.get('dataset')) {
    datasets.push(...Object.keys(treeSettings))
  }



  for (const [key, value] of urlParams.entries()) {
    if (isServerAllowedSearchParamKey(key)) {
      reservedParams[key] = value
      if (key == 'datasetTag' && !urlParams.get('dataset')) { // Don't add datasets to the search if dataset is already set
        if (value == 'base') {
          datasets.push(...Object.keys(datasetTitles).filter(key => key.endsWith('_g')))
        }
      }
      else if (key == 'group') {
        termFilters.push({ "term": { "group.id": base64UrlToString(value) } })
      }
      else if (key == 'within') {
        termFilters.push({
          "term": { "within.keyword": reservedParams.within }
        });
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
      else if (value == '_true' || value == '_false') {
        if (isHierarchicalAdmFacet(key)) {
          if (!clientFacets[key]) clientFacets[key] = [];
          clientFacets[key].push(value);
        } else {
          // Keep _true/_false with regular facet values so they can be OR-combined
          // (e.g. field missing OR field has one of selected values).
          if (!serverFacets[key]) {
            serverFacets[key] = [];
          }
          serverFacets[key].push(value);
        }
      }
      // Explicitly exclude the "[ingen verdi]" bucket: require that the field exists
      else if (value === '!_false') {
        if (isHierarchicalAdmFacet(key)) {
          // For adm, treat as requiring any adm value (equivalent to _true)
          if (!clientFacets[key]) clientFacets[key] = [];
          clientFacets[key].push('_true');
        } else {
          termFilters.push({ "exists": { "field": key } });
        }
      }
      else {
        const facets = isHierarchicalAdmFacet(key) ? clientFacets : serverFacets;
        if (!facets[key]) {
          facets[key] = [];
        }
        facets[key].push(value);
      }
    }
  }

  if (reservedParams.radius && reservedParams.point) {
    // Add a distance filter
    termFilters.push({
      "geo_distance": {
        "distance": `${reservedParams.radius}m`,
        "location": reservedParams.point.split(',').map(parseFloat).reverse()
      }
    });
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


  // Hierarchical facets (adm is not a real ES field; handle _true/_false and paths here)
  if (Object.keys(clientFacets).length) {
    for (const admFacetKey of ['adm', 'group.adm']) {
      const admValues = clientFacets[admFacetKey];
      if (!admValues?.length) continue;
      const admFieldPrefix = admFacetKey === 'group.adm' ? 'group.' : '';
      const isAdmPath = (v: string) => v !== '_true' && v.slice(0, 6) !== '_false';
      const isAdmFalse = (v: string) => v.slice(0, 6) === '_false';

      termFilters.push({
        "bool": {
          "should": [
            // adm=_true: docs that have group.adm1
            ...admValues.filter((v: string) => v === '_true').map(() => ({
              "exists": { "field": `${admFieldPrefix}adm1.keyword` }
            })),
            // adm=_false (top-level "[inga verdi]"): docs that have neither group.adm1 nor group.adm2
            ...admValues.filter((v: string) => v === '_false').map(() => ({
              "bool": {
                "must_not": [
                  { "exists": { "field": `${admFieldPrefix}adm1.keyword` } },
                  { "exists": { "field": `${admFieldPrefix}adm2.keyword` } }
                ]
              }
            })),
            // adm=_false__level1__level2: N/A at a specific level
            ...admValues.filter((v: string) => isAdmFalse(v) && v.length > 8).map((value: string) => {
              const levels = value.slice(8).split('__').filter(val => val.length).reverse();
              const mustClauses = levels.map((level: string, index: number) => ({
                "term": { [`${admFieldPrefix}adm${index + 1}.keyword`]: level }
              }));
              const lastLevelIndex = levels.length + 1;
              return {
                "bool": {
                  "must": mustClauses,
                  "must_not": [{ "exists": { "field": `${admFieldPrefix}adm${lastLevelIndex}.keyword` } }]
                }
              };
            }),
            // adm=path (e.g. Agder__Kristiansand)
            ...admValues.filter(isAdmPath).map((value: string) => ({
              "bool": {
                "filter": value.split("__").reverse().map((val: string, index: number) => ({
                  "term": { [`${admFieldPrefix}adm${index + 1}.keyword`]: val }
                }))
              }
            }))
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
      const excludedValues = values.filter((value) => value.startsWith("!")).map((value) => value.slice(1));
      const filteredValues = values.filter(
        (value) => value !== "_false" && value !== "_true" && !value.startsWith("!")
      );
      const fieldName = `${key}${(baseAllConfig[key as keyof typeof baseAllConfig]?.keyword ?? false) ? '' : '.keyword'}`;
      const configuredFields = (baseAllConfig[key as keyof typeof baseAllConfig]?.fields as string[] | undefined)?.filter(Boolean);
      const fieldNames = configuredFields?.length ? configuredFields : [fieldName];
      const facetOperator = baseAllConfig[key as keyof typeof baseAllConfig]?.facetOperator || 'OR';


      // Handle nested properties
      if (key.includes('__')) {
        const [base, nested] = key.split('__');
        termFilters.push({
          "nested": {
            "path": base,
            "query": {
              "bool": {
                "should": [
                  ...(hasFalse ? [{ "bool": { "must_not": { "exists": { "field": `${base}.${nested}` } } } }] : []),
                  ...(hasTrue ? [{ "exists": { "field": `${base}.${nested}` } }] : []),
                  ...(filteredValues.length ? [{ "terms": { [`${base}.${nested}`]: filteredValues } }] : [])
                ],
                ...(excludedValues.length
                  ? {
                    "must_not": [
                      {
                        "terms": {
                          [`${base}.${nested}`]: excludedValues
                        }
                      }
                    ]
                  }
                  : {}),
                "minimum_should_match": 1
              }
            }
          }
        });

      } else if (key == 'dataset') {
        values.forEach(value => {
          if (!datasets.includes(value)) {
            datasets.push(value);
          }
        });


      } else {
        // Default behaviour: OR between selected values
        // Configurable behaviour: AND between selected values for specific facets (e.g. resources)
        if (facetOperator === 'AND' && !hasFalse && !hasTrue && filteredValues.length) {
          // Require that all selected values are present on the field
          termFilters.push({
            "bool": {
              "must": filteredValues.map(value => (
                fieldNames.length === 1
                  ? { "term": { [fieldNames[0]]: value } }
                  : {
                    "bool": {
                      "should": fieldNames.map((name: string) => ({
                        "term": { [name]: value }
                      })),
                      "minimum_should_match": 1
                    }
                  }
              )),
              ...(excludedValues.length
                ? {
                  "must_not": [
                    ...(fieldNames.length === 1
                      ? [{
                        "terms": {
                          [fieldNames[0]]: excludedValues
                        }
                      }]
                      : [{
                        "bool": {
                          "should": fieldNames.map((name: string) => ({
                            "terms": { [name]: excludedValues }
                          })),
                          "minimum_should_match": 1
                        }
                      }])
                  ]
                }
                : {})
            }
          });
        } else {
          termFilters.push({
            "bool": {
              "should": [
                ...(hasFalse
                  ? [{
                    "bool": {
                      "must_not": fieldNames.map((name: string) => ({ "exists": { "field": name } }))
                    }
                  }]
                  : []),
                ...(hasTrue
                  ? [{
                    "bool": {
                      "should": fieldNames.map((name: string) => ({ "exists": { "field": name } })),
                      "minimum_should_match": 1
                    }
                  }]
                  : []),
                ...(filteredValues.length
                  ? [fieldNames.length === 1
                    ? { "terms": { [fieldNames[0]]: filteredValues } }
                    : {
                      "bool": {
                        "should": fieldNames.map((name: string) => ({
                          "terms": { [name]: filteredValues }
                        })),
                        "minimum_should_match": 1
                      }
                    }]
                  : [])
              ],
              ...(excludedValues.length
                ? {
                  "must_not": [
                    ...(fieldNames.length === 1
                      ? [{
                        "terms": {
                          [fieldNames[0]]: excludedValues
                        }
                      }]
                      : [{
                        "bool": {
                          "should": fieldNames.map((name: string) => ({
                            "terms": { [name]: excludedValues }
                          })),
                          "minimum_should_match": 1
                        }
                      }])
                  ]
                }
                : {}),
              "minimum_should_match": 1
            }
          });
        }
      }




    }
  }

  // Exclude group.id "suppressed" and "noname" from all queries unless tree/cadastral view or includeSuppressed
  if (reservedParams.includeSuppressed !== 'on') {
    termFilters.push({
      bool: { must_not: { terms: { 'group.id': ['suppressed', 'noname'] } } }
    });
  }

  if (datasets.length) {
    termFilters.push({
      "bool": {
        "should": datasets.map(tag => ({
          "term": {
            "_index": `search-stadnamn-${process.env.SN_ENV}-${tag}`
          }
        })),
        "minimum_should_match": 1
      }
    });

  }

  return { termFilters, reservedParams, rangeFilters, datasets }


}