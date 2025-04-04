export const runtime = 'edge'

import { postQuery } from '../_utils/post';

export async function fetchIIIFSearch(collection: string, q?: string, type?: string, size?: number) {
  

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
    if (q) {
      mustConditions.push({
        "term": {
          ["collections.uuid"]: collection
        }
      });
    } else {
      mustConditions.push({
        "term": {
          ["partOf"]: collection
        }
      });
    }
  }
  
  // Add search query if provided
  if (q) {
    mustConditions.push({
      "simple_query_string": {
        "query": `${q} ${q}*`,
        "fields": ["label.*^3", "metadata.value.*^2", "canvases.label.*", "summary.*"],
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
    "size": size || 1000,
    "fields": ["uuid", "order", "canvases.image", "canvases.height", "canvases.width", "type", "label.no", "label.none", "label.en", "audio.uuid"],
    "_source": false,
    "aggs": {
      "types": {
        "terms": {
          "field": "type",
          "size": 2
        }
      }
    }
  };

  const [response, status] = await postQuery('iiif_*', query)

  return {response, status}
}