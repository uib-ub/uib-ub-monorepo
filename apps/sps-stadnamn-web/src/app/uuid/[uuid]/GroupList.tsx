'use client'
import { datasetTitles } from '@/config/metadata-config'
import { defaultResultRenderer, resultRenderers } from '@/config/result-renderers'
import { stringToBase64Url } from '@/lib/param-utils'
import { getFieldValue } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { PiBookOpen } from 'react-icons/pi'

const normalizeLabel = (value?: string | null) =>
  (value || '').replace(/\s+/g, ' ').trim().toLowerCase()

const firstValue = (v: any) => Array.isArray(v) ? v[0] : v
const toPrefix = (v: any) => {
  const x = firstValue(v)
  if (x == null) return ''
  const s = String(x)
  if (!s || s === '0') return ''
  return `${s} `
}

const getGroupData = async (groupId: string, size: number) => {
  const res = await fetch(`/api/group?group=${groupId}&size=${size}`)
  if (!res.ok) {
    throw new Error('Failed to fetch group')
  }

  const data: any = await res.json()

  // Support both old ES-style responses (hits.hits) and the current /api/group response (sources[])
  const items: any[] = Array.isArray(data?.sources)
    ? data.sources
    : Array.isArray(data?.hits?.hits)
      ? data.hits.hits
      : []

  const total: number =
    typeof data?.total === 'number'
      ? data.total
      : typeof data?.hits?.total?.value === 'number'
        ? data.hits.total.value
        : items.length

  // `/api/group` currently returns all sources (server ignores `size`), so we enforce the collapsed
  // view client-side by slicing to `size` while keeping `total` for the expand button.
  const visibleItems = Number.isFinite(size) ? items.slice(0, size) : items

  // Group the visible items by dataset
  const groupedByDataset: Record<string, any[]> = {}
  visibleItems.forEach((item: any) => {
    const datasetTag =
      typeof item?.dataset === 'string'
        ? item.dataset
        : typeof item?._index === 'string'
          ? item._index.split('-')[2]
          : 'unknown'

    if (!groupedByDataset[datasetTag]) {
      groupedByDataset[datasetTag] = []
    }
    groupedByDataset[datasetTag].push(item)
  })

  return { groupedByDataset, total }
}

// Skeleton component for loading state
const GroupListSkeleton = () => (
  <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
    <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Grupperte stadnamn</h2>
    <div className="flex flex-col gap-2">
      {/* Skeleton for dataset groups */}
      {[1, 2].map((groupIndex) => (
        <div key={groupIndex} className="mt-2">
          {/* Dataset title skeleton */}
          <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2 w-3/4"></div>
          <ul className="!p-0 !list-none divide-y divide-neutral-200 gap-2">
            {/* Skeleton for list items */}
            {[1, 2, 3].map((itemIndex) => (
              <li key={itemIndex} className="flex flex-grow !p-0 !m-0">
                <div className="w-full h-full flex items-center gap-2 py-1">
                  {/* Icon skeleton */}
                  <div className="w-6 h-6 bg-neutral-200 rounded-full animate-pulse"></div>
                  {/* Text skeleton */}
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-1 w-full"></div>
                    <div className="h-3 bg-neutral-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Show more button skeleton */}
      <div className="h-10 bg-neutral-200 rounded animate-pulse mt-2"></div>
    </div>
  </aside>
)

export default function GroupList({ docData }: { docData: Record<string, any> }) {
  const [size, setSize] = useState(5)
  const groupId: string | undefined = docData?._source?.group?.id
  const currentUuid: string | undefined = docData?._source?.uuid

  const { data, isLoading } = useQuery({
    queryKey: ['group', groupId, size],
    enabled: !!groupId,
    placeholderData: (prevData) => prevData,
    queryFn: () => getGroupData(stringToBase64Url(groupId as string), size)
  })

  const handleShowMore = () => {
    setSize(1000)
  }

  // Show skeleton while loading
  if (isLoading && !data) {
    return <GroupListSkeleton />
  }

  // If the document has no group, don't render an empty "Namnegruppe" box
  if (!groupId) {
    return null
  }

  return <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
    <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Namnegruppe</h2>
    {data && <div className="flex flex-col gap-2">
      {Object.entries(data.groupedByDataset).map(([docDataset, hits]) => {
        const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
        const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails

        const items = (hits as any[]) || []
        const itemMap = new Map<string, any>()
        items.forEach((item) => {
          const uuid = (getFieldValue(item, 'uuid') || [])?.[0]
          if (uuid) itemMap.set(uuid, item)
        })

        // Filter away children (items with a parent in this dataset) that have the same label as their parent.
        const filteredItems = items.filter((item) => {
          const uuid = (getFieldValue(item, 'uuid') || [])?.[0]
          if (!uuid) return false
          const within = (getFieldValue(item, 'within') || [])?.[0]
          if (!within || !itemMap.has(within)) return true

          const childLabel = ((getFieldValue(item, 'label') || [])?.[0] || '') as string
          const parent = itemMap.get(within)
          const parentLabel = ((getFieldValue(parent, 'label') || [])?.[0] || '') as string
          if (!childLabel || !parentLabel) return true

          return normalizeLabel(childLabel) !== normalizeLabel(parentLabel)
        })

        return <div key={docDataset} className="mt-2">
          <h3 className="!m-0 !p-0 font-serif !text-lg !font-normal">{datasetTitles[docDataset] || docDataset}</h3>
          <ul className="!p-0 !list-none divide-y divide-neutral-200 gap-2">
            {filteredItems.map((hit: any, index: number) => {
              const hitUuid = (getFieldValue(hit, 'uuid') || [])?.[0]
              if (!hitUuid) return null

              const within = (getFieldValue(hit, 'within') || [])?.[0]
              const isChild = !!within && itemMap.has(within)

              const cadastre = getFieldValue(hit, 'cadastre')
              const firstCad = Array.isArray(cadastre) ? cadastre[0] : undefined

              let cadastrePrefix = ''
              if (firstCad) {
                if (!isChild && firstCad?.gnr != null) {
                  const gnr = firstCad.gnr
                  const gnrText = Array.isArray(gnr) ? gnr.join(',') : String(gnr)
                  if (gnrText && gnrText !== '0') cadastrePrefix = `${gnrText} `
                }
                if (isChild && firstCad?.bnr != null) {
                  const bnr = firstCad.bnr
                  const bnrText = Array.isArray(bnr) ? bnr.join(',') : String(bnr)
                  if (bnrText && bnrText !== '0') cadastrePrefix = `${bnrText} `
                }
              }

              // Special-case: Matrikkelen 1838 uses misc.MNR / misc.LNR rather than cadastre.gnr/bnr.
              if (!cadastrePrefix && docDataset === 'm1838') {
                cadastrePrefix = isChild
                  ? toPrefix(getFieldValue(hit, 'misc.LNR'))
                  : toPrefix(getFieldValue(hit, 'misc.MNR'))
              }

              return (
                <li key={`${hitUuid}-${index}`} className="flex flex-grow !p-0 !m-0">
                  <Link
                    aria-current={currentUuid === hitUuid ? 'page' : undefined}
                    className="w-full h-full flex items-center gap-2 py-1 no-underline group"
                    href={"/uuid/" + hitUuid}
                  >
                    <div className="group-hover:bg-neutral-100 p-1 rounded-full">
                      <PiBookOpen className="text-primary-700 aria-[current='page']:text-accent-800" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-neutral-950">
                        {cadastrePrefix && <span className="font-semibold">{cadastrePrefix}</span>}
                        {sourceTitle(hit)}
                        {sourceDetails(hit)}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      })}

      {data.total > size && (
        <button
          onClick={handleShowMore}
          className="btn btn-outline flex items-center justify-center gap-2 py-2 px-4 w-full"
        >
          <span className="text-sm font-medium text-neutral-700">
            Vis fleire ({data.total - size})
          </span>
        </button>
      )}
    </div>}
  </aside>

}