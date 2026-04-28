function modifyQuery(query: string) {
  const lowerCaseQuery = query.toLowerCase();

  // Escape special characters
  let escapedQuery = lowerCaseQuery.replace(/([=&&||!(){}[\]^:\\/])/g, '\\$1');

  // Remove < and >, as they cannot be escaped
  escapedQuery = escapedQuery.replace(/[<>]/g, '');

  if (lowerCaseQuery.includes('aa')) {
    return `(${escapedQuery}) OR (${escapedQuery.replace(/aa/gi, 'å')})`;
  }

  if (lowerCaseQuery.includes('å')) {
    return `(${escapedQuery}) OR (${escapedQuery.replace(/å/gi, 'aa')})`;
  }

  return escapedQuery;
}

const baseNameFields = [
  "label^5",
  "group.label^4",
  "altLabels^4",
  "attestations.label^3",
]

const fulltextFields = ["content.text", "content.html", "note"]
const admFieldsWeighted = ["adm2^2", "group.adm2^2", "group.adm1^1.5", "adm1^1.5"]
const gnrLikeFields = ["gnr", "mnr", "cadastre.gnr"]

function buildSingleFieldFilter(field: string, value: string) {
  return {
    term: {
      [field]: value,
    },
  }
}

function buildAnyFieldFilter(fields: string[], value: string) {
  if (fields.length === 1) {
    return buildSingleFieldFilter(fields[0], value)
  }

  return {
    bool: {
      should: fields.map((field) => buildSingleFieldFilter(field, value)),
      minimum_should_match: 1,
    },
  }
}

function buildCadastreFirstTokenClause(token: string) {
  const trimmed = token.trim()
  if (!trimmed) return null

  let remaining = trimmed
  const structuredFilters: any[] = []

  const knrPrefixedMatch = remaining.match(/^(\d{4})-(.+)$/)
  if (knrPrefixedMatch) {
    const [, knr, rest] = knrPrefixedMatch
    structuredFilters.push(buildSingleFieldFilter("knr", knr))
    remaining = rest
  }

  const slashMatch = remaining.match(/^(\d+)\/(\d+)$/)
  if (slashMatch) {
    const [, beforeSlash, afterSlash] = slashMatch
    structuredFilters.push(buildAnyFieldFilter(["gnr", "cadastre.gnr"], beforeSlash))
    structuredFilters.push(buildAnyFieldFilter(["bnr", "cadastre.bnr"], afterSlash))
  } else {
    const dotMatch = remaining.match(/^(\d+)\.(\d+)$/)
    if (dotMatch) {
      const [, beforeDot, afterDot] = dotMatch
      structuredFilters.push(buildSingleFieldFilter("mnr", beforeDot))
      structuredFilters.push(buildSingleFieldFilter("lnr", afterDot))
    } else {
      const numberOnlyMatch = remaining.match(/^(\d+)$/)
      if (numberOnlyMatch) {
        const [, value] = numberOnlyMatch
        if (value.length === 4 && !knrPrefixedMatch) {
          structuredFilters.push(buildSingleFieldFilter("knr", value))
        } else if (value.length < 4) {
          structuredFilters.push(buildAnyFieldFilter(gnrLikeFields, value))
        }
      }
    }
  }

  if (!structuredFilters.length) {
    return null
  }

  return {
    bool: {
      should: [
        buildSingleFieldFilter("cadastrePath", trimmed),
        {
          bool: {
            filter: structuredFilters,
          },
        },
      ],
      minimum_should_match: 1,
    },
  }
}

function tokenizeWithQuotes(raw: string): string[] {
  const tokens: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (!inQuotes && (char === "," || /\s/.test(char))) {
      if (current.trim()) {
        tokens.push(current.trim())
      }
      current = ""
    } else {
      current += char
    }
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  // As an extra safety measure, strip unmatched quotes which can
  // cause Elasticsearch query_string parse errors.
  return tokens.map((token) => {
    const quoteCount = (token.match(/"/g) || []).length
    if (quoteCount % 2 !== 0) {
      return token.replace(/"/g, "")
    }
    return token
  })
}

function splitFirstToken(raw: string): { firstToken: string; rest: string } {
  let i = 0
  let inQuotes = false

  while (i < raw.length && (raw[i] === "," || /\s/.test(raw[i]))) {
    i++
  }
  const start = i

  while (i < raw.length) {
    const char = raw[i]
    if (char === '"') {
      inQuotes = !inQuotes
      i++
      continue
    }
    if (!inQuotes && (char === "," || /\s/.test(char))) {
      break
    }
    i++
  }

  const firstToken = raw.slice(start, i).trim()

  while (i < raw.length && (raw[i] === "," || /\s/.test(raw[i]))) {
    i++
  }
  const rest = raw.slice(i).trim()

  return { firstToken, rest }
}

function buildRegularQueryClause(raw: string, nameFields: string[]) {
  if (!raw.trim()) {
    return null
  }

  if (raw.includes(",")) {
    const tokens = tokenizeWithQuotes(raw)
    const firstToken = tokens[0]
    const trailingTokens = tokens.slice(1)

    const firstTokenClause = firstToken
      ? {
        query_string: {
          query: modifyQuery(firstToken),
          allow_leading_wildcard: true,
          default_operator: "AND",
          fields: nameFields,
        },
      }
      : null

    const trailingClauses = trailingTokens.map((token) => ({
      query_string: {
        query: modifyQuery(token),
        allow_leading_wildcard: true,
        default_operator: "OR",
        fields: [...nameFields, ...admFieldsWeighted],
      },
    }))

    if (firstTokenClause && trailingClauses.length > 0) {
      return {
        bool: {
          must: [firstTokenClause],
          should: trailingClauses,
          minimum_should_match: 1,
        },
      }
    }

    return firstTokenClause
  }

  return {
    query_string: {
      query: modifyQuery(raw),
      allow_leading_wildcard: true,
      default_operator: "AND",
      fields: nameFields,
    },
  }
}

import type { ServerAllowedParams } from "@/lib/reserved-param-types";

export function getQueryString(
  params: ServerAllowedParams,
) {
  const fulltext = params.fulltext == "on"
  const fuzzy = params.fuzzy == "on"
  const nameFields =
    fulltext ? [...baseNameFields, ...fulltextFields] : baseNameFields

  let simple_query_string: any = null

  if (params.q) {
    const rawInput = params.q.trim()

    // Strip unclosed (unpaired) double quotes from the full query string,
    // since dangling quotes can cause Elasticsearch query_string parse errors.
    const totalQuoteCount = (rawInput.match(/"/g) || []).length
    const sanitizedInput =
      totalQuoteCount % 2 === 0 ? rawInput : rawInput.replace(/"/g, "")

    const isSimpleToken =
      !sanitizedInput.includes(",") &&
      !/\s/.test(sanitizedInput) &&
      !(
        sanitizedInput.length >= 2 &&
        sanitizedInput.startsWith('"') &&
        sanitizedInput.endsWith('"')
      )

    const { firstToken, rest } = splitFirstToken(sanitizedInput)
    const cadastreFirstTokenClause = firstToken
      ? buildCadastreFirstTokenClause(firstToken)
      : null

    // Når fuzzy er på for eit enkelt ord, kombinerer vi:
    // - ein vanleg query_string (styrer relevans-score)
    // - éi ekstra fuzzy match-klause på label for å få med omtrentlege treff
    if (cadastreFirstTokenClause) {
      const restClause = buildRegularQueryClause(rest, nameFields)

      simple_query_string = restClause
        ? {
          bool: {
            must: [cadastreFirstTokenClause, restClause],
          },
        }
        : cadastreFirstTokenClause
    } else if (fuzzy && isSimpleToken) {
      const baseQueryString = {
        query_string: {
          query: modifyQuery(sanitizedInput),
          allow_leading_wildcard: true,
          default_operator: "AND",
          fields: nameFields,
        },
      }

      simple_query_string = {
        bool: {
          should: [
            // Vanleg simple_query_string på alle namnefelt
            baseQueryString,
            // Ekstra fuzzy-match berre på label
            {
              match: {
                label: {
                  query: rawInput,
                  fuzziness: 2,
                  prefix_length: 1,
                  boost: 1.0,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      }
    } else {
      const raw = sanitizedInput
      simple_query_string = buildRegularQueryClause(raw, nameFields)
    }
  }

  //const test = fulltext && params.dataset ? Object.fromEntries(fulltextFields[params.dataset].map(item => ([item.key, {}]))) : {}


  const highlight =
    params.q && fulltext
      ? {
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
          boundary_scanner_locale: "nn-NO",
          fields: {
            altLabels: {},
            "attestations.label": {},
            ...Object.fromEntries(fulltextFields.map((f) => [f, {}])),
          },
        }
      : null



  return { highlight, simple_query_string }
}
