import { fulltextFields } from "@/config/search-config";

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

export function getQueryString(
  params: { [key: string]: string | null },
  options?: { datasets?: string[] }
) {
  const fulltext = params.fulltext == "on"
  const perspective = params.perspective || "all"
  // When only one dataset is selected (e.g. Hordanamn), use it for fulltext fields
  const effectivePerspective =
    perspective === "all" &&
    options?.datasets?.length === 1 &&
    fulltextFields[options.datasets[0]]
      ? options.datasets[0]
      : perspective

  const fulltextFieldKeys =
    fulltext && effectivePerspective !== "all" && fulltextFields[effectivePerspective]
      ? fulltextFields[effectivePerspective].map((f) => f.key)
      : []
  const nameFields =
    fulltextFieldKeys.length > 0
      ? [...baseNameFields, ...fulltextFieldKeys]
      : baseNameFields

  let simple_query_string: any = null

  if (params.q) {
    const raw = params.q.trim()

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

  //const test = fulltext && params.dataset ? Object.fromEntries(fulltextFields[params.dataset].map(item => ([item.key, {}]))) : {}


  const highlight = params.q && fulltext ? {
    pre_tags: ["<mark>"],
    post_tags: ["</mark>"],
    boundary_scanner_locale: "nn-NO",

    fields: {
      "altLabels": {},
      "attestations.label": {},
      "content.text": {},
      "content.html": {},
      //...test,
      ...(fulltext && effectivePerspective !== "all" && fulltextFields[effectivePerspective]
        ? Object.fromEntries(fulltextFields[effectivePerspective].map((item) => [item.key, {}]))
        : {})
    }
  } : null

  console.log("SIMPLE QUERY STRING", JSON.stringify(simple_query_string, null, 2))


  return { highlight, simple_query_string }
}
