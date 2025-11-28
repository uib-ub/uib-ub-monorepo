import { extractFacets } from '@/app/api/_utils/facets';
import { postQuery } from '@/app/api/_utils/post';
import { getQueryString } from '@/app/api/_utils/query-string';
import { getSortArray } from '@/config/server-config';

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

export async function GET(request: Request) {
  const { reservedParams } = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'

  let sortArray: (string | object)[] = []

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }

  const queryString = reservedParams.q?.toLowerCase() || ""
  const hasWhitespace = queryString.trim().includes(' ')

  let queryClause: Record<string, any>

  if (hasWhitespace) {
    // Split query by whitespace
    const parts = queryString.trim().split(/\s+/)
    const prefixPart = parts[parts.length - 1] // Last word as prefix
    const requiredParts = parts.slice(0, -1) // First word(s) as required match
    const requiredQuery = requiredParts.join(' ')

    // Get simple_query_string for the preceding tokens
    const { simple_query_string: requiredSimpleQuery } = getQueryString({
      ...reservedParams,
      q: requiredQuery
    })

    // Build fields for adm boost query
    const admFields = ["adm1", "adm2", "group.adm1", "group.adm2"]

    queryClause = {
      "bool": {
        "must": [
          requiredSimpleQuery || { "match_all": {} },
          {
            "prefix": {
              "label": prefixPart
            }
          }
        ],
        "should": [
          {
            "query_string": {
              "query": modifyQuery(prefixPart),
              "allow_leading_wildcard": true,
              "default_operator": "AND",
              "fields": admFields.map(field => `${field}^0.01`)
            }
          }
        ]
      }
    }
  } else {
    // No whitespace: use original behavior
    queryClause = {
      "dis_max": {
        "queries": [
          {
            "term": {
              "label": {
                "value": queryString,
                "boost": 10.0
              }
            }
          },
          {
            "prefix": {
              "label": queryString
            }
          }
        ],
        "tie_breaker": 0.3
      }
    }
  }

  const query: Record<string, any> = {
    "size": reservedParams.size || 10,
    ...reservedParams.from ? { from: reservedParams.from } : {},
    "query": queryClause,
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


  console.log("QUERY", query)






  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, { status: status })

}