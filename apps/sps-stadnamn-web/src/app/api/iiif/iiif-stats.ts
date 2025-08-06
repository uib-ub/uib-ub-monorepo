export const runtime = 'edge'

import { postQuery } from '../_utils/post';

export async function fetchIIIFStats(manifestUuid?: string) {
  'use server'
  const [stats, status] = await postQuery('iiif_*', {
    size: 0,
    query: manifestUuid 
      ? {
          term: { "collections.uuid": manifestUuid }
        }
      : {
          match_all: {}
        },
    aggs: {
      total_manifests: {
        sum: {
          field: "childCount.manifests"
        }
      },
      total_images: {
        sum: {
          field: "childCount.images"
        }
      },
      total_reused_images: {
        sum: {
          field: "childCount.reusedImages"
        }
      },
      total_audio: {
        sum: {
          field: "childCount.audio"
        }
      }
    }
  })

  if (status !== 200) {
    return null
  }

  return  {
    manifests: stats?.aggregations?.total_manifests?.value,
    images: stats?.aggregations?.total_images?.value,
    reusedImages: stats?.aggregations?.total_reused_images?.value,
    audio: stats?.aggregations?.total_audio?.value
  }
}

