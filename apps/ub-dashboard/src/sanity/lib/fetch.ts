import 'server-only'

import { defineLive } from 'next-sanity/live'
import type { QueryParams } from '@sanity/client'

import { client } from './client'

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  fetchOptions: {
    revalidate: false,
  },
})

export type SanityFetchOptions<QueryString extends string> = {
  query: QueryString
  params?: QueryParams
  tags?: string[]
}