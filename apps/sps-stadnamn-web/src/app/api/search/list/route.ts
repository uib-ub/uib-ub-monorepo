//export the runtime = 'edge'

import { base64UrlToString } from '@/lib/param-utils';
import { extractFacets } from '../../_utils/facets';
import { postQuery } from '../../_utils/post';
import { getQueryString } from '../../_utils/query-string';

export async function POST(request: Request) {
  const { size, from, 
          sortPoint,
          searchSort,
          selectedGroup,
          noGeo,
          contextAdmPairs,
          init,
          exclude,
          idField,
          sourceViewOn,
  } = await request.json()
  const { termFilters, reservedParams } = extractFacets(request)
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  const hasInit = Boolean(init)

  const baseSort: any[] = []

  if (reservedParams.datasetTag == 'base') {
    baseSort.push({ 'group.id': "asc" }, { 'label.keyword': "asc" })
  } else {
    if (searchSort === 'similarity') {
      // Likskap: 1. score, 2. boost
      // In noGeo mode we rely on score boosts (cadastrePath/adm) to influence ordering.
      if (noGeo || reservedParams.q) baseSort.push({ _score: "desc" })
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
    } else {
      // Avstand: 1. avstand, 2. boost, 3. score
      // In noGeo mode, distance sorting is not meaningful (hits are missing location),
      // and it also interferes with score-based prioritization.
      if (sortPoint && !noGeo) {
        baseSort.push({
          _geo_distance: {
            location: {
              type: 'Point',
              coordinates: sortPoint
            },
            order: "asc"
          }
        })
      }
      // In noGeo mode we need _score to take precedence over boost, especially without init.
      if (noGeo) baseSort.push({ _score: "desc" })
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
      if (reservedParams.q && !noGeo) baseSort.push({ _score: "desc" })
    }
  }

  const query: Record<string, any> = {
    "size": size || 10,
    ...from ? { from } : {},
    ...highlight ? { highlight } : {},
    "track_scores": true,
    "fields": ["group.adm1", "group.adm2", "group.id", "adm1", "adm2", "group.label", "uuid", "boost", "label", "location", "iiif", "sosi"],
    ...(!sourceViewOn && !selectedGroup ? {
      "collapse": {
        "field": "group.id",
      }
    } : {}),
    "sort": baseSort,
    "_source": false
  }

  if (exclude && idField) {
    const exclusion: any = {
      "terms": {
        [idField as string]: [exclude]
      }
    };

    termFilters.push({
      "bool": {
        "must_not": exclusion
      }
    } as any);
  }
  if (noGeo) {
    termFilters.push({
      "bool": {
        "must_not": { "exists": { "field": "location" } }
      }
    } as any);
  }

  if (selectedGroup) {
    termFilters.push({ "term": { "group.id": selectedGroup } });
  }

  // Construct the query part
  let baseQuery: any;

  if (simple_query_string && termFilters.length) {
    baseQuery = {
      "bool": {
        "must": simple_query_string,
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    baseQuery = {
      "bool": {
        "must": simple_query_string
      }
    }
  }
  else if (termFilters.length) {
    baseQuery = {
      "bool": {
        "filter": termFilters
      }
    }
  }
  else {
    baseQuery = {
      "bool": {
        "must": { "match_all": {} }
      }
    }
  }

  // Prefer matches to the selected group context when showing "Utan koordinatar".
  // Priority:
  // 1) same (adm1, adm2)
  if (noGeo) {
    const should: any[] = []

    const pairs: Array<{ adm1: string; adm2: string }> = Array.isArray(contextAdmPairs)
      ? contextAdmPairs
        .filter((p: any) =>
          p &&
          typeof p.adm1 === 'string' &&
          p.adm1.trim() &&
          typeof p.adm2 === 'string' &&
          p.adm2.trim()
        )
        .slice(0, 200)
      : []

    for (const p of pairs) {
      should.push({
        constant_score: {
          filter: {
            bool: {
              filter: [
                {
                  match: {
                    adm1: {
                      query: p.adm1.trim(),
                      fuzziness: 'AUTO',
                    },
                  },
                },
                {
                  match: {
                    adm2: {
                      query: p.adm2.trim(),
                      fuzziness: 'AUTO',
                    },
                  },
                },
              ],
            },
          },
          // If there's no init group selected, let local context outrank Grunnord.
          boost: hasInit ? 0.25 : 5.0,
        },
      })
    }

    if (should.length) {
      baseQuery.bool = baseQuery.bool || {}
      baseQuery.bool.should = [...(baseQuery.bool.should ?? []), ...should]
      if (baseQuery.bool.minimum_should_match == null) {
        baseQuery.bool.minimum_should_match = 0
      }
    }
  }


  query.query = baseQuery;

  const [data, status] = await postQuery('all', query, "dfs_query_then_fetch")

  return Response.json(data, { status: status })

}