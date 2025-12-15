import type { NextRequest } from 'next/server'
import { postQuery } from '@/app/api/_utils/post'

const IIIF_ITEMS_PER_SITEMAP = 10_000
const UUID_ITEMS_PER_SITEMAP = 10_000

// Non-IIIF datasets that should be exposed under `/uuid/<uuid>`.
const UUID_DATASETS = ['leks', 'leks_g', 'rygh', 'rygh_g', 'ostf', 'tot'] as const

function uuidIndexNames(): string[] {
  // Filter by actual index names (matches approach used elsewhere, e.g. stats).
  return UUID_DATASETS.map((dataset) => `search-stadnamn-${process.env.SN_ENV}-${dataset}`)
}

function getBaseUrlFromRequest(request: NextRequest): string {
  try {
    const { origin } = new URL(request.url)
    if (origin) return origin
  } catch { }
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (host) return `${proto}://${host}`
  return 'https://stadnamn.no'
}

function sitemapIndexXml(urls: string[]): string {
  const entries = urls.map((u) => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</sitemapindex>',
    '',
  ].join('\n')
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(request)

  const iiifCountQuery = {
    size: 0,
    track_total_hits: true,
    query: {
      bool: {
        must: [{ term: { type: 'Manifest' } }],
      },
    },
  }

  const uuidCountQuery = {
    size: 0,
    track_total_hits: true,
    query: {
      bool: {
        filter: [{ terms: { _index: uuidIndexNames() } }],
      },
    },
  }

  const [[iiifRes, iiifStatus], [uuidRes, uuidStatus]] = await Promise.all([
    postQuery('iiif_*', iiifCountQuery, undefined, ['all']),
    postQuery('all', uuidCountQuery, undefined, ['all']),
  ])

  const iiifTotal: number | undefined = iiifRes?.hits?.total?.value
  const uuidTotal: number | undefined = uuidRes?.hits?.total?.value

  const iiifSitemapCount =
    iiifStatus === 200 && typeof iiifTotal === 'number' && Number.isFinite(iiifTotal)
      ? Math.max(0, Math.ceil(iiifTotal / IIIF_ITEMS_PER_SITEMAP))
      : 0

  const uuidSitemapCount =
    uuidStatus === 200 && typeof uuidTotal === 'number' && Number.isFinite(uuidTotal)
      ? Math.max(0, Math.ceil(uuidTotal / UUID_ITEMS_PER_SITEMAP))
      : 0

  const urls = [
    `${baseUrl}/sitemap/0.xml`,
    ...Array.from({ length: iiifSitemapCount }, (_, i) => `${baseUrl}/sitemap/${i + 1}.xml`),
    ...Array.from({ length: uuidSitemapCount }, (_, i) => `${baseUrl}/sitemap/u-${i + 1}.xml`),
  ]

  return new Response(sitemapIndexXml(urls), {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600',
    },
  })
}


