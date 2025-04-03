import { postQuery } from "../_utils/post";

export async function fetchIIIFNeighbours(order: number, partOf: string) {
  'use server'
  // Separate query to get the last item
  const minAndMax = {
    size: 0,
    query: {
      term: {
        "partOf": partOf
      }
    },
    aggs: {
      first_item: {
        top_hits: {
          size: 1,
          sort: [{"order": "asc"}],
          _source: false,
          fields: ["uuid", "order"]
        }
      },
      last_item: {
        top_hits: {
          size: 1,
          sort: [{"order": "desc"}],
          _source: false,
          fields: ["uuid", "order"]
        }
      }
    }
  }
  const [minMaxData, minMaxStatus] = await postQuery('iiif_*', minAndMax)


  // Fix the property access path for aggregations
  const lastItemPosition = minMaxData.aggregations?.last_item?.hits?.hits?.[0]?.fields?.order?.[0]

  
  
  // Query for neighbors and first item
  const neighboursQuery = {
    size: 7,
    from: order > lastItemPosition - 4 ? 
        Math.max(0, lastItemPosition - 7) : // When near the end, show last 7 items
        Math.max(0, order - 4), // Otherwise, center the current item
    query: {
      term: {
        "partOf": partOf
      }
    },
    sort: [
      {
        "order": "asc"
      }
    ],
    fields: ["uuid", "order", "canvases.image", "canvases.height", "canvases.width", "label.no", "label.none", "label.en", "type", "audio.uuid"],
    _source: false,
  }

  
  
  const [neighboursData, neighboursStatus] = await postQuery('iiif_*', neighboursQuery)

  console.log(neighboursData)
  
  return {
    data: {
      first: minMaxData.aggregations?.first_item?.hits?.hits?.[0]?.fields?.uuid?.[0],
      previous: neighboursData.hits.hits.find((hit: any) => hit.fields.order?.[0] == order - 1)?.fields?.uuid?.[0],
      next: neighboursData.hits.hits.find((hit: any) => hit.fields.order?.[0] == order + 1)?.fields?.uuid?.[0],
      neighbours: neighboursData.hits.hits,
      last: minMaxData.aggregations?.last_item?.hits?.hits?.[0]?.fields?.uuid?.[0]
    },
    total: lastItemPosition,
    status: neighboursStatus
  }
}