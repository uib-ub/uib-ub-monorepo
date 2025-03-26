export const runtime = 'edge'

import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  
  // extract parameters from the request using standard URL parsing
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection') || '';
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || '';
  const size = url.searchParams.get('size') || 20;

  // Build query conditions
  const mustConditions = [];
  const mustNotConditions = [];
  
  // Add type filter if provided
  if (type) {
    mustConditions.push({
      "term": {
        "type": type
      }
    });
  }
  
  // Add collection filter if provided
  if (collection) {
    mustConditions.push({
      "term": {
        ["partOf"]: collection
      }
    });
  }
  
  // Add search query if provided
  if (q) {
    mustConditions.push({
      "simple_query_string": {
        "query": q + "*",
        "fields": ["label.*^3", "metadata.value.*^2", "canvases.label.*"],
        "default_operator": "or"
      }
    });
  }
  
  // If no collection and no q, filter for top-level collections
  if (!collection && !q) {
    // Add Collection type if no specific type is requested

    
    // Exclude items with partOf
    mustNotConditions.push({
      "exists": {
        "field": "partOf"
      }
    });
  }

  // Build the final query
  const query = {
    "query": {
      "bool": {
        "must": mustConditions,
        "must_not": mustNotConditions
      }
    },
    "sort": q ? ["_score"] : ["order"],
    "size": size,
    "aggs": {
      "types": {
        "terms": {
          "field": "type",
          "size": 2  // Set to a high number to get all types
        }
      }
    }
  };

  const [data, status] = await postQuery('iiif_*', query)

  return Response.json(data, {status: status})
}