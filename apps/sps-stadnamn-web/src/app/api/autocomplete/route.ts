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
  // - For single-token queries (no whitespace), use the existing prefix-based
  //   autocomplete logic.
  // - For queries with multiple tokens (t1 .. tn):
  //   - t1: must match the label (and only the label).
  //   - t2 .. t{n-1}: must match either the label or any adm field, with label
  //     preferred via scoring.
  //   - tn (last token): must match as a prefix on label or adm (label should
  //     be preferred; exact matches are later prioritised client-side).
  let queryClause: Record<string, any>
  if (!hasWhitespace) {
    queryClause = basePrefixQuery
  } else {
    const parts = queryString.split(/\s+/).filter((p) => p.length > 0)
    const rawParts = rawQueryString.split(/\s+/).filter((p) => p.length > 0)

    const firstToken = parts[0]
    const lastToken = parts[parts.length - 1]
    const middleTokens = parts.slice(1, -1)
    const rawLastToken = rawParts[rawParts.length - 1] || ""
    const firstPartRaw = rawParts.slice(0, -1).join(" ").trim()

    const admFields = ["adm1", "adm2", "group.adm1", "group.adm2"]

    const mustClauses: any[] = []

    // 1) First token must match label (and only label).
    if (firstToken?.length > 0) {
      mustClauses.push({
        "match": {
          "label": {
            "query": firstToken,
            "operator": "and"
          }
        }
      })
    }

    // 2) Middle tokens must match either label or adm, with label preferred
    //    via scoring boosts.
    middleTokens.forEach((token) => {
      if (!token.length) return

      const shouldClauses: any[] = [
        {
          "match": {
            "label": {
              "query": token,
              "operator": "and",
              "boost": 3.0
            }
          }
        },
        ...admFields.map((field) => ({
          "match": {
            [field]: {
              "query": token,
              "operator": "and",
              "boost": 1.0
            }
          }
        }))
      ]

      mustClauses.push({
        "bool": {
          "should": shouldClauses,
          "minimum_should_match": 1
        }
      })
    })

    // 3) Last token must match as prefix.
    //    - For two-token queries (e.g. "nordre ber"), we only allow prefix
    //      matches on the label so that cases like "Nordre Tuft, Bergen"
    //      (where only adm matches the last token) are filtered out.
    //    - For three-or-more-token queries (e.g. "indre berg troms"), we allow
    //      prefix matches on both label and adm fields so queries like
    //      "indre berg troms" can use the last token to match adm names.
    if (lastToken?.length > 0) {
      const lastTokenVariants = new Set<string>()
      lastTokenVariants.add(lastToken)
      if (rawLastToken && rawLastToken !== lastToken) {
        lastTokenVariants.add(rawLastToken)
      }
      const capitalizedLast =
        rawLastToken.length > 0
          ? rawLastToken[0].toUpperCase() + rawLastToken.slice(1)
          : ""
      if (capitalizedLast && capitalizedLast !== rawLastToken) {
        lastTokenVariants.add(capitalizedLast)
      }

      const labelPrefixClauses: any[] = []
      const admPrefixClauses: any[] = []

      lastTokenVariants.forEach((value) => {
        labelPrefixClauses.push({
          "prefix": {
            "label": value
          }
        })

        admFields.forEach((field) => {
          admPrefixClauses.push({
            "prefix": {
              [field]: value
            }
          })
        })
      })

      const buildLabelKeywordVariants = (value: string): string[] => {
        const trimmed = value.trim()
        if (!trimmed) return []
        const variants = new Set<string>()
        variants.add(trimmed)
        variants.add(trimmed.toLowerCase())
        variants.add(trimmed.toUpperCase())
        variants.add(
          trimmed
            .split(/\s+/)
            .map(
              (word) =>
                word.length > 0
                  ? word[0].toUpperCase() + word.slice(1).toLowerCase()
                  : word
            )
            .join(" ")
        )
        return Array.from(variants).filter((variant) => variant.length > 0)
      }

      const labelEqualsFirstPartClause =
        firstPartRaw.length > 0
          ? {
              "bool": {
                "should": buildLabelKeywordVariants(firstPartRaw).map(
                  (variant) => ({
                    "term": {
                      "label.keyword": variant
                    }
                  })
                ),
                "minimum_should_match": 1
              }
            }
          : null

      const allowAdmPrefix =
        parts.length >= 3 || (!!labelEqualsFirstPartClause && parts.length >= 2)

      const admPrefixWrapper =
        allowAdmPrefix && admPrefixClauses.length > 0
          ? parts.length >= 3
            ? {
                "bool": {
                  "should": admPrefixClauses,
                  "minimum_should_match": 1
                }
              }
            : {
                "bool": {
                  "must": [
                    labelEqualsFirstPartClause!,
                    {
                      "bool": {
                        "should": admPrefixClauses,
                        "minimum_should_match": 1
                      }
                    }
                  ]
                }
              }
          : null

      mustClauses.push({
        "bool": {
          "should": [
            ...labelPrefixClauses,
            ...(admPrefixWrapper ? [admPrefixWrapper] : [])
          ],
          "minimum_should_match": 1
        }
      })
    }

    queryClause = {
      "bool": {
        "must": mustClauses
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