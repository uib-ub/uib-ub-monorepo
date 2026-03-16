//export the runtime = 'edge'

import { base64UrlToString } from '@/lib/param-utils';
import { extractFacets } from '../../_utils/facets';
import { postQuery } from '../../_utils/post';
import { getQueryString } from '../../_utils/query-string';

export async function POST(request: Request) {
  const { size, from, 
          sortPoint,
          searchSort,
          groupValue,
          noGeo,
          exclude,
          idField,
          sourceView,
  } = await request.json()
  const { termFilters, reservedParams } = extractFacets(request)
  const { highlight, simple_query_string } = getQueryString(reservedParams)


  const baseSort: any[] = []

  if (reservedParams.datasetTag == 'base') {
    baseSort.push({ 'group.id': "asc" }, { 'label.keyword': "asc" })
  } else {
    if (searchSort === 'similarity') {
      // Likskap: 1. score, 2. boost
      if (reservedParams.q) {
        baseSort.push({ _score: "desc" })
      }
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
    } else {
      // Avstand: 1. avstand, 2. boost, 3. score
      if (sortPoint) {
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
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
      if (reservedParams.q) {
        baseSort.push({ _score: "desc" })
      }
    }
  }

  const query: Record<string, any> = {
    "size": size || 10,
    ...from ? { from } : {},
    ...highlight ? { highlight } : {},
    "track_scores": true,
    "fields": ["group.adm1", "group.adm2", "group.id", "adm1", "adm2", "group.label", "uuid", "boost", "label", "location", "iiif", "sosi"],
    ...(!sourceView && !groupValue ? {
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
    termFilters.push({ "bool": { "must_not": { "exists": { "field": "location" } } } });
  }

  if (groupValue) {
    termFilters.push({ "term": { "group.id": groupValue } });
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


  query.query = baseQuery;

  const [data, status] = await postQuery('all', query, "dfs_query_then_fetch")
  return Response.json(data, { status: status })

}