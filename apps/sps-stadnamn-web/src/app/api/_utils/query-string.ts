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

      // If there is a comma, treat everything after the first comma as "adm" part
      if (raw.includes(",")) {
        const [namePartRaw, admPartRaw] = raw.split(",", 2)
        const namePart = namePartRaw.trim()
        const admPart = admPartRaw.trim()

        const nameQuery = namePart
          ? {
              query_string: {
                query: modifyQuery(namePart),
                allow_leading_wildcard: true,
                default_operator: "AND",
                fields: nameFields,
              },
            }
          : null

        const admQuery = admPart
          ? {
              query_string: {
                query: modifyQuery(admPart),
                allow_leading_wildcard: true,
                default_operator: "AND",
                fields: [
                  "adm2^2",
                  "group.adm2^2",
                  "group.adm1^1",
                  "adm1^1",
                ],
              },
            }
          : null

        const mustClauses = [nameQuery, admQuery].filter(Boolean)

        simple_query_string =
          mustClauses.length === 1
            ? mustClauses[0]
            : {
                bool: {
                  must: mustClauses,
                },
              }
      } else {
        // Quoted phrase: pass whole string so query_string can do phrase search
        const isQuotedPhrase =
          raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')

        if (isQuotedPhrase) {
          simple_query_string = {
            query_string: {
              query: modifyQuery(raw),
              allow_leading_wildcard: true,
              default_operator: "AND",
              fields: nameFields,
            },
          }
        } else {
          const tokens = raw.split(/\s+/).filter(Boolean)

          if (tokens.length > 1) {
            const firstToken = tokens[0]
            const trailingTokens = tokens.slice(1)

            const firstTokenClause = {
              query_string: {
                query: modifyQuery(firstToken),
                allow_leading_wildcard: true,
                default_operator: "AND",
                fields: nameFields,
              },
            }

            const trailingClauses = trailingTokens.map((token) => ({
              query_string: {
                query: modifyQuery(token),
                allow_leading_wildcard: true,
                default_operator: "AND",
                fields: [...nameFields, "adm2^2", "group.adm2^2", "group.adm1^1", "adm1^1"],
              },
            }))

            simple_query_string = {
              bool: {
                must: [firstTokenClause, ...trailingClauses],
              },
            }
          } else {
            // No comma and a single token: single query_string across name fields
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
