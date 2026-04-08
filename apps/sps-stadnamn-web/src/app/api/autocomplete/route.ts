import { extractFacets } from '@/app/api/_utils/facets';
import { postQuery } from '@/app/api/_utils/post';
import { getSortArray } from '@/config/server-config';

// Check if query contains special characters that should disable autocomplete
function hasSpecialCharacters(query: string): boolean {
  // Allow alphanumeric, spaces, comma, hyphen, slash, and Norwegian characters (å, æ, ø)
  // Everything else is considered a special character
  return /[^a-zæøå0-9,\s\/-]/i.test(query);
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
  const startsWithNumber = /^\d/.test(queryString)
  const normalizedCadastrePrefix = rawQueryString.replace(/[/-]+$/g, "")
  
  // If query contains special characters, return empty results
  if (queryString && hasSpecialCharacters(queryString)) {
    return Response.json({ hits: { hits: [], total: { value: 0 } } }, { status: 200 })
  }

  const hasWhitespace = queryString.includes(' ')
  const hasComma = queryString.includes(',')

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
  const labelExactBoost = startsWithNumber ? 2.0 : 10.0
  const labelPrefixBoost = startsWithNumber ? 1.0 : 5.0

  const basePrefixQuery = {
    "bool": {
      "should": [
        {
          "term": {
            "label.keyword": {
              "value": capitalizedQuery || queryString,
              "boost": labelExactBoost
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
            "boost": labelPrefixBoost
          }
        },
        ...(startsWithNumber
          ? [
              {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "cadastreText.path": {
                          "query": rawQueryString,
                          "boost": 12.0
                        }
                      }
                    },
                    {
                      "constant_score": {
                        "filter": {
                          "prefix": {
                            "cadastreText.path": rawQueryString
                          }
                        },
                        "boost": 8.0
                      }
                    },
                    {
                      "match_bool_prefix": {
                        "cadastreText.path": {
                          "query": rawQueryString,
                          "operator": "and",
                          "boost": 6.0
                        }
                      }
                    },
                    ...(normalizedCadastrePrefix && normalizedCadastrePrefix !== rawQueryString
                      ? [
                          {
                            "match_phrase": {
                              "cadastreText.path": {
                                "query": normalizedCadastrePrefix,
                                "boost": 10.0
                              }
                            }
                          },
                          {
                            "constant_score": {
                              "filter": {
                                "prefix": {
                                  "cadastreText.path": normalizedCadastrePrefix
                                }
                              },
                              "boost": 7.0
                            }
                          },
                          {
                            "match_bool_prefix": {
                              "cadastreText.path": {
                                "query": normalizedCadastrePrefix,
                                "operator": "and",
                                "boost": 5.5
                              }
                            }
                          }
                        ]
                      : [])
                  ],
                  "minimum_should_match": 1
                }
              }
            ]
          : [])
      ],
      "minimum_should_match": 1,
      ...(startsWithNumber
        ? {}
        : {
            "must_not": [
              {
                "regexp": {
                  "label.keyword": ".*\\s.*"
                }
              }
            ]
          })
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
  if (!hasWhitespace && !hasComma) {
    queryClause = basePrefixQuery
  } else {
    const [beforeCommaRaw, afterCommaRaw = ""] = rawQueryString.split(",", 2)
    const beforeCommaTokens = beforeCommaRaw
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => p.length > 0)
    const afterCommaTokens = afterCommaRaw
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => p.length > 0)
    const parts = hasComma
      ? [...beforeCommaTokens, ...afterCommaTokens]
      : queryString.split(/\s+/).filter((p) => p.length > 0)
    const rawParts = hasComma
      ? [...beforeCommaRaw.split(/\s+/).filter(Boolean), ...afterCommaRaw.split(/\s+/).filter(Boolean)]
      : rawQueryString.split(/\s+/).filter((p) => p.length > 0)

    const firstToken = parts[0]
    const rawFirstToken = rawParts[0] || firstToken || ""
    const normalizedFirstCadastrePrefix = rawFirstToken.replace(/[/-]+$/g, "")
    const rawLastToken = rawParts[rawParts.length - 1] || ""
    const firstPartRaw = rawParts.slice(0, -1).join(" ").trim()
    const trailingBeforeCommaTokens = hasComma ? beforeCommaTokens.slice(1) : parts.slice(1, -1)
    const lastToken =
      hasComma && afterCommaTokens.length > 0
        ? afterCommaTokens[afterCommaTokens.length - 1]
        : parts[parts.length - 1]
    const middleTokensAfterComma =
      hasComma && afterCommaTokens.length > 1 ? afterCommaTokens.slice(0, -1) : []

    const admFields = [
      "adm1",
      "adm2",
      "group.adm1",
      "group.adm2",
      ...(startsWithNumber ? ["cadastreText.path"] : [])
    ]

    const mustClauses: any[] = []

    // 1) First token must match label. For numeric-leading input we also allow
    //    cadastre path, since cadastral identifiers start with digits.
    if (firstToken?.length > 0) {
      if (startsWithNumber) {
        mustClauses.push({
          "bool": {
            "should": [
              ...(rawFirstToken
                ? [
                    {
                      "match_phrase": {
                        "cadastreText.path": {
                          "query": rawFirstToken,
                          "boost": 10.0
                        }
                      }
                    },
                    {
                      "prefix": {
                        "cadastreText.path": {
                          "value": rawFirstToken,
                          "boost": 8.0
                        }
                      }
                    },
                    {
                      "match_bool_prefix": {
                        "cadastreText.path": {
                          "query": rawFirstToken,
                          "operator": "and",
                          "boost": 6.0
                        }
                      }
                    }
                  ]
                : []),
              ...(normalizedFirstCadastrePrefix && normalizedFirstCadastrePrefix !== rawFirstToken
                ? [
                    {
                      "match_phrase": {
                        "cadastreText.path": {
                          "query": normalizedFirstCadastrePrefix,
                          "boost": 9.0
                        }
                      }
                    },
                    {
                      "prefix": {
                        "cadastreText.path": {
                          "value": normalizedFirstCadastrePrefix,
                          "boost": 7.0
                        }
                      }
                    },
                    {
                      "match_bool_prefix": {
                        "cadastreText.path": {
                          "query": normalizedFirstCadastrePrefix,
                          "operator": "and",
                          "boost": 5.5
                        }
                      }
                    }
                  ]
                : []),
              {
                "match": {
                  "label": {
                    "query": firstToken,
                    "operator": "and",
                    "boost": 0.5
                  }
                }
              }
            ],
            "minimum_should_match": 1
          }
        })
      } else {
        mustClauses.push({
          "match": {
            "label": {
              "query": firstToken,
              "operator": "and"
            }
          }
        })
      }
    }

    // 2) Tokens between first and last (before comma) must match either label
    //    or adm, with label preferred via scoring boosts.
    //
    // For comma queries:
    // - tokens before comma (except the first) follow the same preference
    // - tokens after comma are adm-prioritised but still allow label matches
    //    via scoring boosts.
    trailingBeforeCommaTokens.forEach((token) => {
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

    middleTokensAfterComma.forEach((token) => {
      if (!token.length) return

      const shouldClauses: any[] = [
        {
          "match": {
            "label": {
              "query": token,
              "operator": "and",
              "boost": 1.5
            }
          }
        },
        ...admFields.map((field) => ({
          "match": {
            [field]: {
              "query": token,
              "operator": "and",
              "boost": 3.0
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

      const commaAdmPrefixWrapper =
        hasComma && admPrefixClauses.length > 0
          ? {
              "bool": {
                "should": admPrefixClauses,
                "minimum_should_match": 1,
                "boost": 2.5
              }
            }
          : null

      mustClauses.push({
        "bool": {
          "should": [
            ...labelPrefixClauses,
            ...(commaAdmPrefixWrapper
              ? [commaAdmPrefixWrapper]
              : admPrefixWrapper
                ? [admPrefixWrapper]
                : [])
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

  // Apply filters (termFilters from extractFacets already includes suppressed/noname exclusion when not tree/cadastral)
  let finalQuery: Record<string, any>
  if (termFilters.length > 0) {
    finalQuery = {
      "bool": {
        "must": queryClause,
        "filter": termFilters
      }
    }
  } else {
    finalQuery = {
      "bool": {
        "must": queryClause
      }
    }
  }

  const query: Record<string, any> = {
    "size": reservedParams.size || 10,
    ...reservedParams.from ? { from: reservedParams.from } : {},
    "query": finalQuery,
    "track_scores": true,
    "track_total_hits": false,
    "fields": [
      "group.adm1",
      "group.adm2",
      "group.label",
      "adm1",
      "adm2",
      "cadastreText.path",
      "uuid",
      "boost",
      "label",
      "location",
      "group.id"
    ],
    "highlight": {
      "pre_tags": ["[[H]]"],
      "post_tags": ["[[/H]]"],
      "require_field_match": false,
      "number_of_fragments": 0,
      "fields": {
        "label": {},
        "group.label": {},
        "adm1": {},
        "adm2": {},
        "group.adm1": {},
        "group.adm2": {},
        "cadastreText.path": {}
      }
    },
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