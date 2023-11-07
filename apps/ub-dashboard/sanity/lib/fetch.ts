import 'server-only'

import type { QueryParams } from '@sanity/client'
import { draftMode } from 'next/headers'

import { client } from './client'

export const token = process.env.SANITY_API_READ_TOKEN

const DEFAULT_PARAMS = {} as QueryParams
const DEFAULT_TAGS = [] as string[]

export async function sanityFetch<QueryResponse>({
  query,
  params = DEFAULT_PARAMS,
  tags = DEFAULT_TAGS,
  revalidate,
}: {
  query: string
  params?: QueryParams
  tags?: string[]
  revalidate?: number
}): Promise<QueryResponse> {
  const isDraftMode = draftMode().isEnabled

  if (isDraftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
  }

  return client.fetch<QueryResponse>(query, params, {
    // We only cache if there's a revalidation webhook setup
    cache: 'force-cache',
    ...(isDraftMode && {
      cache: undefined,
      token: token,
      perspective: 'previewDrafts',
    }),
    ...(revalidate && { cache: undefined }),
    next: {
      ...(isDraftMode && { revalidate: 30 }),
      ...(!revalidate ? tags : { revalidate }),
    },
  })
}