export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

/**
 * @swagger
 * /api/search/table:
 *   get:
 *     tags:
 *       - search
 *     description: Returns paginated search results in a tabular format
 *     parameters:
 *       - in: query
 *         name: dataset
 *         schema:
 *           type: string
 *         description: The dataset to search in. Defaults to 'search'
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of results to return per page. Defaults to 10
 *       - in: query
 *         name: from
 *         schema:
 *           type: integer
 *         description: Starting index for pagination. Defaults to 0
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string for filtering results
 *       - in: query
 *         name: asc
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to sort in ascending order
 *       - in: query
 *         name: desc
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to sort in descending order
 *     responses:
 *       200:
 *         description: Search results in tabular format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hits:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           description: Total number of matching results
 *                         relation:
 *                           type: string
 *                           enum: [eq, gte]
 *                           description: Whether the total is exact or estimated
 *                     hits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Search result documents with requested fields
 */

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset || 'search'  // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  // Add sorting from URL parameters
  if (filteredParams.asc) {
    sortArray = filteredParams.asc.split(',').map(field => ({
      [field]: { order: 'asc' }
    }));
  } else if (filteredParams.desc) {
    sortArray = filteredParams.desc.split(',').map(field => ({
      [field]: { order: 'desc' }
    }));
  }

  // Fallback to default sorting if no sort parameters provided
  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

    
  const query: Record<string,any> = {
    "track_total_hits": 5000000,
    "size":  filteredParams.size || 10,
    "from": filteredParams.from || 0,
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