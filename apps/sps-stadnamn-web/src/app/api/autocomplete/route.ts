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

  const queryString = reservedParams.q?.toLowerCase().trim() || ""
  
  // If query contains special characters, return empty results
  if (queryString && hasSpecialCharacters(queryString)) {
    return Response.json({ hits: { hits: [], total: { value: 0 } } }, { status: 200 })
  }

  const hasWhitespace = queryString.includes(' ')

  let queryClause: Record<string, any>

  if (hasWhitespace) {
    // Split query by whitespace
    const parts = queryString.split(/\s+/).filter(p => p.length > 0)
    const prefixPart = parts[parts.length - 1] // Last word as prefix
    const requiredParts = parts.slice(0, -1) // Preceding word(s)

    // For each preceding word, create exact match queries (word must match in at least one field)
    const exactMatchGroups = requiredParts.map(part => ({
      "bool": {
        "should": [
          {
            "term": {
              "label": {
                "value": part,
                "boost": 15.0
              }
            }
          },
          {
            "term": {
              "adm1": {
                "value": part,
                "boost": 10.0
              }
            }
          },
          {
            "term": {
              "adm2": {
                "value": part,
                "boost": 10.0
              }
            }
          }
        ],
        "minimum_should_match": 1
      }
    }))

    // Prefix fields that should support prefix matching for the last word
    const prefixFields = ["label", "adm1", "adm2", "group.adm1", "group.adm2"]

    // Create prefix queries for all relevant fields
    const prefixQueries = prefixFields.map(field => ({
      "constant_score": {
        "filter": {
          "prefix": {
            [field]: prefixPart
          }
        },
        "boost": field === "label" ? 20.0 : 15.0
      }
    }))

    // Combine exact matches for preceding words with prefix match for last word
    queryClause = {
      "function_score": {
        "query": {
          "bool": {
            "must": exactMatchGroups.length > 0 ? exactMatchGroups : [{ "match_all": {} }],
            "should": prefixQueries,
            "minimum_should_match": 1
          }
        },
        // Penalize longer labels - shorter labels get higher scores
        "script_score": {
          "script": {
            "source": "Math.max(0.1, 1.0 / (1.0 + doc['label.keyword'].value.length() / 15.0))"
          }
        },
        "boost_mode": "multiply"
      }
    }
  } else {
    // Single word: use exact match and prefix match
    queryClause = {
      "function_score": {
        "query": {
          "bool": {
            "should": [
              {
                "term": {
                  "label": {
                    "value": queryString,
                    "boost": 10.0
                  }
                }
              },
              {
                "constant_score": {
                  "filter": {
                    "prefix": {
                      "label": queryString
                    }
                  },
                  "boost": 5.0
                }
              }
            ],
            "minimum_should_match": 1
          }
        },
        // Penalize longer labels - shorter labels get higher scores
        "script_score": {
          "script": {
            "source": "Math.max(0.1, 1.0 / (1.0 + doc['label.keyword'].value.length() / 15.0))"
          }
        },
        "boost_mode": "multiply"
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