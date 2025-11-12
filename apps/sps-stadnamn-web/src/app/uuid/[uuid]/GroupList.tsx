'use client'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import { defaultResultRenderer } from '@/config/result-renderers'
import { stringToBase64Url } from '@/lib/param-utils'
import { getFieldValue } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { PiBookOpen, PiPlusBold } from 'react-icons/pi'

const getGroupData = async (groupId: string, size: number) => {
    const res = await fetch(`/api/group?group=${groupId}&size=${size}`)
    if (!res.ok) {
        throw new Error('Failed to fetch group')
    }

    const data = await res.json()
    
    // Group the hits by dataset
    const groupedByDataset: Record<string, any[]> = {}
    
    if (data.hits?.hits) {
        data.hits.hits.forEach((hit: any) => {
            const datasetTag = hit._index.split('-')[2]
            if (!groupedByDataset[datasetTag]) {
                groupedByDataset[datasetTag] = []
            }
            groupedByDataset[datasetTag].push(hit)
        })
    }

    return {
        groupedByDataset,
        total: data.hits?.total?.value || 0
    }
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
          <ul className="!p-0 divide-y divide-neutral-200 gap-2">
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

export default function GroupList({docData}: {docData: Record<string, any>}) {
    const [size, setSize] = useState(5)

    const { data, isLoading } = useQuery({
        queryKey: ['group', docData._source.group?.id, size],
        placeholderData: (prevData) => prevData,
        queryFn: () => getGroupData(stringToBase64Url(docData._source.group?.id), size)
    })

    const handleShowMore = () => {
        setSize(1000)
    }

    // Show skeleton while loading
    if (isLoading && !data) {
        return <GroupListSkeleton />
    }

    return <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
    <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Namnegruppe</h2>
    {data && <div className="flex flex-col gap-2">
        {Object.entries(data.groupedByDataset).map(([docDataset, hits]) => {
            const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
            const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails

            return <div key={docDataset} className="mt-2">
                <h3 className="!m-0 !p-0 font-serif !text-lg !font-normal">{datasetTitles[docDataset] || docDataset}</h3>
                <ul className="!p-0 divide-y divide-neutral-200 gap-2">
                    {(hits as any[]).map((hit: any, index: number) => (
                        <li key={index} className="flex flex-grow !p-0 !m-0">
                            <Link aria-current={docData._source.uuid == getFieldValue(hit, 'uuid') ? 'page' : undefined} className="w-full h-full flex items-center gap-2 py-1 no-underline group" href={"/uuid/" + getFieldValue(hit, 'uuid')}>
                                <div className="group-hover:bg-neutral-100 p-1 rounded-full">
                                    <PiBookOpen className="text-primary-700 aria-[current='page']:text-accent-800" />
                                </div>
                                {sourceTitle(hit)}
                                {sourceDetails(hit)}
                            </Link>
                        </li>
                    ))}
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