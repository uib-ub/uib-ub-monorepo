import { datasetTitles } from '@/config/metadata-config'
import { postQuery } from '../../_utils/post'

type CountResult = {
  dataset: string
  index: string
  statsTotalHits: number | null
  searchTotalHits: number | null
  searchTotalHitsIncludingSuppressed: number | null
  deltaStatsMinusSearch: number | null
  deltaSearchIncludingSuppressedMinusSearch: number | null
}

function asNumber(value: any): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

function buildIndexName(dataset: string) {
  return `search-stadnamn-${process.env.SN_ENV}-${dataset}`
}

function buildStatsLikeQuery(index: string) {
  // Mirrors `fetchStats()` front-page totalHits behaviour (excludes suppressed + noname).
  return {
    size: 0,
    track_total_hits: true,
    query: {
      bool: {
        filter: [{ term: { _index: index } }],
        must_not: [{ terms: { 'group.id': ['suppressed', 'noname'] } }],
      },
    },
    _source: false,
  }
}

function buildSearchLikeQuery(index: string, includeSuppressed: boolean) {
  // Mirrors `extractFacets()` default exclusion + dataset filter + `/api/search` use of hits.total.
  const filters: any[] = [
    { term: { _index: index } },
    ...(includeSuppressed
      ? []
      : [
          {
            bool: {
              must_not: { terms: { 'group.id': ['suppressed', 'noname'] } },
            },
          },
        ]),
  ]

  return {
    track_total_hits: 10_000_000,
    track_scores: false,
    size: 0,
    _source: false,
    query: {
      bool: {
        must: { match_all: {} },
        filter: filters,
      },
    },
  }
}

async function fetchTotalHits(perspective: string, query: any, cacheTags: string[]) {
  const [data, status] = await postQuery(perspective, query, undefined, cacheTags)
  if (status !== 200) return null
  return asNumber(data?.hits?.total?.value)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const onlyDataset = url.searchParams.get('dataset')?.trim() || null

  const datasets = Object.keys(datasetTitles)
    .filter((d) => !d.startsWith('_core'))
    .filter((d) => (onlyDataset ? d === onlyDataset : true))

  const results: CountResult[] = []

  for (const dataset of datasets) {
    const index = buildIndexName(dataset)

    const [statsTotalHits, searchTotalHits, searchTotalHitsIncludingSuppressed] =
      await Promise.all([
        fetchTotalHits('all', buildStatsLikeQuery(index), ['all', 'debug', 'stats-like', dataset]),
        fetchTotalHits('all', buildSearchLikeQuery(index, false), ['all', 'debug', 'search-like', dataset]),
        fetchTotalHits(
          'all',
          buildSearchLikeQuery(index, true),
          ['all', 'debug', 'search-like-includeSuppressed', dataset],
        ),
      ])

    const deltaStatsMinusSearch =
      statsTotalHits != null && searchTotalHits != null ? statsTotalHits - searchTotalHits : null

    const deltaSearchIncludingSuppressedMinusSearch =
      searchTotalHitsIncludingSuppressed != null && searchTotalHits != null
        ? searchTotalHitsIncludingSuppressed - searchTotalHits
        : null

    results.push({
      dataset,
      index,
      statsTotalHits,
      searchTotalHits,
      searchTotalHitsIncludingSuppressed,
      deltaStatsMinusSearch,
      deltaSearchIncludingSuppressedMinusSearch,
    })
  }

  const mismatches = results
    .filter((r) => r.statsTotalHits != null && r.searchTotalHits != null)
    .filter((r) => r.deltaStatsMinusSearch !== 0)
    .sort((a, b) => Math.abs((b.deltaStatsMinusSearch ?? 0) as number) - Math.abs((a.deltaStatsMinusSearch ?? 0) as number))

  return Response.json(
    {
      meta: {
        env: process.env.SN_ENV ?? null,
        datasetFilter: onlyDataset,
        comparedDatasets: results.length,
        mismatchingDatasets: mismatches.length,
        note:
          'statsTotalHits mirrors fetchStats() totalHits; searchTotalHits mirrors /api/search default filters (excludes suppressed + noname).',
      },
      mismatches,
      all: results,
    },
    { status: 200 },
  )
}

