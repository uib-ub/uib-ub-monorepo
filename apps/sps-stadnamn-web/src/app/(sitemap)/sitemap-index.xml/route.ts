import type { NextRequest } from 'next/server'
import {
  fetchGitAppRawFile,
  getBaseUrlFromRequestHeaders,
  rewriteSitemapLocOrigins,
} from '@/app/(sitemap)/git-app'

function getBaseUrlFromRequest(request: NextRequest): string {
  try {
    const { origin } = new URL(request.url)
    if (origin) return origin
  } catch { }
  return getBaseUrlFromRequestHeaders(request.headers)
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(request)

  const raw = await fetchGitAppRawFile({
    path: 'lfs-data/sitemap/sitemap-index.xml',
  })

  if (!raw.ok) {
    return new Response(raw.error, {
      status: raw.status,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const xml = rewriteSitemapLocOrigins(raw.content, baseUrl)
  return new Response(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600',
    },
  })
}


