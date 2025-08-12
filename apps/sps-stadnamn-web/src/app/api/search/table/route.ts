export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';


export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
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

    
  const query: Record<string,any> = {
    "track_total_hits": 5000000,
    "size":  reservedParams.size || 10,
    "from": reservedParams.from || 0,
    ...highlight ? {highlight} : {},
    "sort": [...sortArray, {uuid: {order: 'asc'}}],
    "_source": true
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }

  const [data, status] = await postQuery(dataset, query)

  return Response.json(data, {status: status})
  
}