
import { getSortArray } from '@/config/server-config';
import { extractFacets } from '../../_utils/facets';
import { postQuery } from '../../_utils/post';
import { getQueryString } from '../../_utils/query-string';


export async function GET(request: Request) {
  const { termFilters, reservedParams } = extractFacets(request)
  const dataset = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []

  // Convert field names with double underscores to nested field paths
  const convertToNestedPath = (field: string) => {
    if (field.includes('__')) {
      const [parent, child] = field.split('__');
      return {
        [`${parent}.${child}`]: { order: 'asc', nested: { path: parent } }
      };
    }
    return { [field]: { order: 'asc' } };
  };

  // Add sorting from URL parameters
  if (reservedParams.asc) {
    sortArray = reservedParams.asc.split(',').map(field => convertToNestedPath(field));
  } else if (reservedParams.desc) {
    sortArray = reservedParams.desc.split(',').map(field => ({
      ...convertToNestedPath(field),
      [Object.keys(convertToNestedPath(field))[0]]: {
        ...Object.values(convertToNestedPath(field))[0],
        order: 'desc'
      }
    }));
  }

  // Fallback to default sorting if no sort parameters provided
  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }


  const suppressedExclusion = {
    "terms": {
      "group.id": ["suppressed", "noname"]
    }
  };

  const query: Record<string, any> = {
    "size": parseInt(reservedParams.size || "10"),
    "from": parseInt(reservedParams.from || "0"),
    ...highlight ? { highlight } : {},
    "sort": [...sortArray, { uuid: { order: 'asc' } }],
    "_source": true
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "filter": termFilters,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else if (simple_query_string) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else if (termFilters.length) {
    query.query = {
      "bool": {
        "filter": termFilters,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else {
    query.query = {
      "bool": {
        "must": { "match_all": {} },
        "must_not": [suppressedExclusion]
      }
    }
  }


  const [data, status] = await postQuery(dataset, query)

  return Response.json(data, { status: status })

}
