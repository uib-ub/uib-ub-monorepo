'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import useDocData from './doc-data';
import { useEffect, useCallback } from 'react';

export default function useGroupData() {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const group = searchParams.get('group')
    
    const { docData } = useDocData()
    const docUuid = docData?._source?.uuid
    const docGroup = docData?._source?.group

    // Use select to transform data and control when re-renders happen
    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['group', group],
        queryFn: async ({ pageParam }) => {
            if (!group) return null
            
            const res = await fetch(`/api/search/group?${searchQueryString}&group=${group}&size=${pageParam.size}&from=${pageParam.from}`)
            if (!res.ok) {
                throw new Error('Failed to fetch group')
            }
            const data = await res.json()
            
            return {
                hits: data.hits?.hits || [],
                total: data.hits?.total,
                size: pageParam.size,
                from: pageParam.from
            }
        },
        initialPageParam: { size: 5, from: 0 },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || !lastPage.hits.length) {
                return undefined
            }
            
            const totalFetched = allPages.reduce((sum, page) => sum + (page?.hits?.length || 0), 0)
            const nextSize = Math.min(lastPage.size * 2, 100)
            const nextFrom = totalFetched
            
            return nextSize <= 100 ? { size: nextSize, from: nextFrom } : undefined
        },
        enabled: !!group,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Transform data and control when to expose it
        select: useCallback((data: any) => {
            const allHits = data?.pages?.flatMap((page: any) => page?.hits || []) || []
            const totalData = data?.pages?.[data.pages.length - 1]?.total
            const docFound = docUuid && allHits.some((hit: any) => hit._source?.uuid === docUuid)
            const allDataFetched = !data?.pageParams || allHits.length >= (totalData?.value || 0)
            
            // Only expose data when document is found OR all data is fetched
            const shouldExposeData = !docUuid || docFound || allDataFetched
            
            return {
                allHits: shouldExposeData ? allHits : [],
                totalData: shouldExposeData ? totalData : null,
                docFound,
                shouldExposeData
            }
        }, [docUuid]),
        // Only re-render when data actually changes (not on intermediate fetches)
        notifyOnChangeProps: ['data', 'error'],
    })

    // Stable callback for fetchNextPage to prevent useEffect re-runs
    const stableFetchNextPage = useCallback(() => {
        fetchNextPage()
    }, [fetchNextPage])

    // Auto-fetch more if doc should be in results but isn't found
    useEffect(() => {
        const shouldFetchMore = docUuid && 
                               docGroup === group && 
                               !processedData?.docFound && 
                               hasNextPage && 
                               !isFetchingNextPage

        if (shouldFetchMore) {
            stableFetchNextPage()
        }
    }, [docUuid, docGroup, group, processedData?.docFound, hasNextPage, isFetchingNextPage, stableFetchNextPage])

    return { 
        groupData: processedData?.allHits || [],
        groupTotal: processedData?.totalData || null,
        groupError, 
        groupLoading: groupLoading || (isFetchingNextPage && !processedData?.shouldExposeData),
        fetchMore: fetchNextPage,
        canFetchMore: hasNextPage
    }
}

