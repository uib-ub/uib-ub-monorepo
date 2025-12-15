import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { datasetPresentation } from '@/config/metadata-config'
import { postQuery } from '@/app/api/_utils/post'

const IIIF_ITEMS_PER_SITEMAP = 10_000
const UUID_ITEMS_PER_SITEMAP = 10_000

// Non-IIIF datasets that should be exposed under `/uuid/<uuid>`.
const UUID_DATASETS = ['leks', 'leks_g', 'rygh', 'rygh_g', 'ostf', 'tot'] as const

function uuidIndexNames(): string[] {
  // Filter by actual index names (matches approach used elsewhere, e.g. stats).
  return UUID_DATASETS.map((dataset) => `search-stadnamn-${process.env.SN_ENV}-${dataset}`)
}

function getBaseUrlFromHeaders(h: Headers): string {
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${proto}://${host}`
  return 'https://stadnamn.no'
}

function extractLastModFromIndexName(indexName: string): Date | undefined {
  // Example: `search-stadnamn-iiif_uit-1764773802-315064cc`
  // Extract epoch seconds (10 digits) or epoch ms (13 digits) from the index name.
  const m = indexName.match(/(?:^|[-_])(\d{10}|\d{13})(?:$|[-_])/)
  if (!m) return undefined

  const raw = m[1]
  const epoch = Number(raw)
  if (!Number.isFinite(epoch)) return undefined

  const ms = raw.length === 13 ? epoch : epoch * 1000
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

export async function generateSitemaps() {
  // 0 is the "meta" sitemap. 1..N are IIIF sitemaps, each capped at IIIF_ITEMS_PER_SITEMAP entries.
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

  const iiifSitemaps = Array.from({ length: iiifSitemapCount }, (_, i) => ({ id: i + 1 }))
  const uuidSitemaps = Array.from({ length: uuidSitemapCount }, (_, i) => ({ id: `u-${i + 1}` }))

  // Safe fallback: always publish at least the meta sitemap.
  return [{ id: 0 }, ...iiifSitemaps, ...uuidSitemaps]
}

async function buildMetaSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const metaPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/info` },
    { url: `${baseUrl}/iiif` },
    { url: `${baseUrl}/help` },
    { url: `${baseUrl}/datasets` },
  ]

  const datasets: MetadataRoute.Sitemap = Object.keys(datasetPresentation)
    .filter((dataset) => dataset !== 'all')
    .map((dataset) => ({
      url: `${baseUrl}/info/datasets/${dataset.split('_')[0]}`,
    }))

  return metaPages.concat(datasets)
}

async function buildIIIFSitemap(page: number, baseUrl: string): Promise<MetadataRoute.Sitemap> {
  if (!Number.isInteger(page) || page < 1) return []
  const from = (page - 1) * IIIF_ITEMS_PER_SITEMAP
  const query = {
    size: IIIF_ITEMS_PER_SITEMAP,
    from,
    track_total_hits: false,
    sort: ['uuid'],
    _source: ['uuid'],
    query: {
      bool: {
        must: [{ term: { type: 'Manifest' } }],
      },
    },
  }

  const [res, status] = await postQuery('iiif_*', query, undefined, ['all'])
  if (status !== 200) return []

  const hits = res?.hits?.hits || []
  return hits
    .map((hit: any) => {
      const uuid = hit?._source?.uuid
      const indexName = hit?._index
      const lastModified =
        typeof indexName === 'string' ? extractLastModFromIndexName(indexName) : undefined

      if (typeof uuid !== 'string' || uuid.length === 0) return null
      return {
        url: `${baseUrl}/iiif/${uuid}`,
        lastModified,
      } satisfies MetadataRoute.Sitemap[number]
    })
    .filter((entry: MetadataRoute.Sitemap[number] | null): entry is MetadataRoute.Sitemap[number] =>
      Boolean(entry),
    )
}

async function buildUuidSitemap(page: number, baseUrl: string): Promise<MetadataRoute.Sitemap> {
  if (!Number.isInteger(page) || page < 1) return []
  const from = (page - 1) * UUID_ITEMS_PER_SITEMAP

  const query = {
    size: UUID_ITEMS_PER_SITEMAP,
    from,
    track_total_hits: false,
    sort: ['uuid'],
    _source: ['uuid'],
    query: {
      bool: {
        filter: [{ terms: { _index: uuidIndexNames() } }],
      },
    },
  }

  const [res, status] = await postQuery('all', query, undefined, ['all'])
  if (status !== 200) return []

  const hits = res?.hits?.hits || []
  return hits
    .map((hit: any) => {
      const uuid = hit?._source?.uuid
      const indexName = hit?._index
      const lastModified =
        typeof indexName === 'string' ? extractLastModFromIndexName(indexName) : undefined

      if (typeof uuid !== 'string' || uuid.length === 0) return null
      return {
        url: `${baseUrl}/uuid/${uuid}`,
        lastModified,
      } satisfies MetadataRoute.Sitemap[number]
    })
    .filter((entry: MetadataRoute.Sitemap[number] | null): entry is MetadataRoute.Sitemap[number] =>
      Boolean(entry),
    )
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id

  const h = await headers()
  const baseUrl = getBaseUrlFromHeaders(h)

  if (rawId === '0') return buildMetaSitemap(baseUrl)

  // Backwards-compatible: numeric ids are IIIF sitemaps.
  if (/^\d+$/.test(rawId)) {
    const page = Number.parseInt(rawId, 10)
    if (!Number.isFinite(page) || page < 1) return []
    return buildIIIFSitemap(page, baseUrl)
  }

  // New: UUID sitemaps for non-IIIF datasets.
  const m = rawId.match(/^u-(\d+)$/)
  if (m) {
    const page = Number.parseInt(m[1], 10)
    if (!Number.isFinite(page) || page < 1) return []
    return buildUuidSitemap(page, baseUrl)
  }

  return []
}


