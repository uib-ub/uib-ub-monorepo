export const runtime = 'edge'

import { postQuery } from '../_utils/post';

export async function fetchIIIFStats() {
  'use server'
  const stats = await postQuery('iiif_*', {
    size: 0,
    query: {
      bool: {
        must_not: {
          exists: {
            field: "partOf"
          }
        }
      }
    },
    aggs: {
      total_images: {
        sum: {
          field: "childCount.image"
        }
      },
      total_manifests: {
        sum: {
          field: "childCount.manifests"
        }
      },
      total_images_count: {
        sum: {
          field: "childCount.images"
        }
      },
      total_audio: {
        sum: {
          field: "childCount.audio"
        }
      }
    }
  })
  return stats
}

