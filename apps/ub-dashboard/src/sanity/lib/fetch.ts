import type { QueryParams } from '@sanity/client'

import { client } from './client'

// eslint-disable-next-line no-process-env
export const token = process.env.SANITY_API_READ_TOKEN!

export async function sanityFetch<QueryString extends string>({
  query,
  params = {},
  revalidate = 60, // default revalidation time in seconds
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  revalidate?: number | false
  tags?: string[]
}) {
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate, // for simple, time-based revalidation
      tags, // for tag-based revalidation
    },
  })
}