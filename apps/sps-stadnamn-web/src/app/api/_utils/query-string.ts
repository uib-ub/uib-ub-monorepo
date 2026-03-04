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

export function getQueryString(params: { [key: string]: string | null }) {
  const fulltext = params.fulltext == "on"
  const fuzzy = params.fuzzy == "on"
  const nameFields =
    fulltext ? [...baseNameFields, ...fulltextFields] : baseNameFields

  let simple_query_string: any = null

  if (params.q) {
    const rawInput = params.q.trim()

    const isSimpleToken =
      !rawInput.includes(",") &&
      !/\s/.test(rawInput) &&
      !(rawInput.length >= 2 && rawInput.startsWith('"') && rawInput.endsWith('"'))

    // Når fuzzy er på for eit enkelt ord, kombinerer vi:
    // - ein vanleg query_string (styrer relevans-score)
    // - éi ekstra fuzzy match-klause på label for å få med omtrentlege treff
    if (fuzzy && isSimpleToken) {
      const baseQueryString = {
        query_string: {
          query: modifyQuery(rawInput),
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
      const raw = rawInput

      // If there is a comma, treat everything after the first comma as an
      // adm-prioritised part:
      // - first token: name fields only
      // - remaining tokens: name + adm fields
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
          simple_query_string = {
            bool: {
              must: [firstTokenClause],
              should: trailingClauses,
              minimum_should_match: 1,
            },
          }
        } else {
          simple_query_string = firstTokenClause
        }
      } else {
        simple_query_string = {
          query_string: {
            query: modifyQuery(raw),
            allow_leading_wildcard: true,
            default_operator: "AND",
            fields: nameFields,
          },
        }
      }
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
