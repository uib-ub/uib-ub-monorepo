import { extractFacets } from '@/app/api/_utils/facets';
import { postQuery } from '@/app/api/_utils/post';
import { getSortArray } from '@/config/server-config';

// Check if query contains special characters that should disable autocomplete
function hasSpecialCharacters(query: string): boolean {
  // Allow alphanumeric, spaces, and Norwegian characters (å, æ, ø)
  // Everything else is considered a special character
  return /[^a-zæøå0-9\s]/i.test(query);
}

export async function GET(request: Request) {
  const { termFilters, reservedParams } = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'

  let sortArray: (string | object)[] = []

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }

  const rawQueryString = reservedParams.q?.trim() || ""
  const queryString = rawQueryString.toLowerCase()
  
  // If query contains special characters, return empty results
  if (queryString && hasSpecialCharacters(queryString)) {
    return Response.json({ hits: { hits: [], total: { value: 0 } } }, { status: 200 })
  }

  const hasWhitespace = queryString.includes(' ')

  // Base prefix query:
  // - Match only on label/label.keyword (no adm fields)
  // - Exact match gets a strong boost (on keyword)
  // - Prefix matches are done on the full string via label.keyword so they are
  //   not token based.
  // - Explicitly excludes any labels that contain whitespace, so messy
  //   multi-word labels do not interfere with single-token autocomplete.
  // To keep these matches effectively case-insensitive against Title Case labels,
  // we query both the raw input and a capitalised variant as prefixes.
  const capitalizedQuery =
    rawQueryString.length > 0
      ? rawQueryString[0].toUpperCase() + rawQueryString.slice(1)
      : rawQueryString

  const basePrefixQuery = {
    "bool": {
      "should": [
        {
          "term": {
            "label.keyword": {
              "value": capitalizedQuery || queryString,
              "boost": 10.0
            }
          }
        },
        {
          "constant_score": {
            "filter": {
              "bool": {
                "should": [
                  {
                    "prefix": {
                      "label.keyword": rawQueryString
                    }
                  },
                  ...(capitalizedQuery && capitalizedQuery !== rawQueryString
                    ? [
                        {
                          "prefix": {
                            "label.keyword": capitalizedQuery
                          }
                        }
                      ]
                    : [])
                ]
              }
            },
            "boost": 5.0
          }
        }
      ],
      "minimum_should_match": 1,
      "must_not": [
        {
          "regexp": {
            "label.keyword": ".*\\s.*"
          }
        }
      ]
    }
  }

  // Query clause:
  // - For single-token queries (no whitespace), use the prefix-based
  //   autocomplete logic only (no results containing whitespace).
  // - For queries with whitespace, split on whitespace:
  //   - all preceding tokens must match exactly (term queries on label)
  //   - the last token is used as a prefix
  //   - additionally, we add a simple_query_string over the full query.
  let queryClause: Record<string, any>
  if (!hasWhitespace) {
    queryClause = basePrefixQuery
  } else {
    const parts = queryString.split(/\s+/).filter((p) => p.length > 0)
    const prefixPart = parts[parts.length - 1]
    const requiredParts = parts.slice(0, -1)

    const exactMatchGroups = requiredParts.map((part) => ({
      "bool": {
        "should": [
          {
            "term": {
              "label": {
                "value": part,
                "boost": 15.0
              }
            }
          }
        ],
        "minimum_should_match": 1
      }
    }))

    // For the last token, allow prefix matches on both label and adm fields so
    // users can type parts of administrative names as well as the primary
    // label.
    const prefixFields = ["label", "adm1", "adm2", "group.adm1", "group.adm2"]
    const prefixQueries = prefixFields.map((field) => ({
      "constant_score": {
        "filter": {
          "prefix": {
            [field]: prefixPart
          }
        },
        "boost": field === "label" ? 20.0 : 15.0
      }
    }))

    const multiWordAutocomplete = {
      "bool": {
        "must": exactMatchGroups.length > 0 ? exactMatchGroups : [{ "match_all": {} }],
        "should": prefixQueries,
        "minimum_should_match": 1
      }
    }

    queryClause = {
      "bool": {
        "should": [
          {
            "simple_query_string": {
              "query": rawQueryString,
              "fields": ["label"],
              "default_operator": "and"
            }
          },
          multiWordAutocomplete
        ],
        "minimum_should_match": 1
      }
    }
  }

  // Exclude suppressed and noname groups, following the same pattern as other routes
  const suppressedExclusion = {
    "terms": {
      "group.id": ["suppressed", "noname"]
    }
  }

  // Apply filters following the same pattern as search routes
  let finalQuery: Record<string, any>
  if (termFilters.length > 0) {
    finalQuery = {
      "bool": {
        "must": queryClause,
        "filter": termFilters,
        "must_not": [suppressedExclusion]
      }
    }
  } else {
    finalQuery = {
      "bool": {
        "must": queryClause,
        "must_not": [suppressedExclusion]
      }
    }
  }

  const query: Record<string, any> = {
    "size": reservedParams.size || 10,
    ...reservedParams.from ? { from: reservedParams.from } : {},
    "query": finalQuery,
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "group.label", "adm1", "adm2", "uuid", "boost", "label", "location", "group.id"],
    "collapse": {
      "field": "group.suggest"
    },
    "sort": [
      { "_score": "desc" },
      { "boost": { "order": "desc", "missing": "_last" } }
    ],
    "_source": false
  }






  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, { status: status })

}