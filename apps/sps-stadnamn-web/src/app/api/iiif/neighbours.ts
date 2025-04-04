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
          _source: ["uuid", "order"]
        }
      },
      last_item: {
        top_hits: {
          size: 1,
          sort: [{"order": "desc"}],
          _source: ["uuid", "order"]
        }
      }
    }
  }
  const [minMaxData, minMaxStatus] = await postQuery('iiif_*', minAndMax)


  // Fix the property access path for aggregations
  const lastItemPosition = minMaxData.aggregations?.last_item?.hits?.hits?.[0]?._source?.order

  
  
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
    _source: ["uuid", "order", "images", "label", "type", "audio"],
  }

  
  
  const [neighboursData, neighboursStatus] = await postQuery('iiif_*', neighboursQuery)

  console.log(neighboursData)
  
  return {
    data: {
      first: minMaxData.aggregations?.first_item?.hits?.hits?.[0]?._source?.uuid,
      previous: neighboursData.hits.hits.find((hit: any) => hit._source.order == order - 1)?._source?.uuid,
      next: neighboursData.hits.hits.find((hit: any) => hit._source.order == order + 1)?._source?.uuid,
      neighbours: neighboursData.hits.hits,
      last: minMaxData.aggregations?.last_item?.hits?.hits?.[0]?._source?.uuid
    },
    total: lastItemPosition,
    status: neighboursStatus
  }
}