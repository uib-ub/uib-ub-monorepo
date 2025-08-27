'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import useDocData from './doc-data';
import { useEffect, useCallback } from 'react';
import { base64UrlToString } from '@/lib/utils';

const groupDataQuery = async (group: string, searchQueryString: string, pageParam: { size: number, from: number }) => {
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
}

export default function useGroupData() {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const group = searchParams.get('group')
    const namesNav = searchParams.get('namesNav')
    const namesScope = searchParams.get('namesScope')
    
    // Check if names navigator is open
    const isNamesNavOpen = !!namesNav
    
    const { docData, docGroup } = useDocData()
    const docUuid = docData?._source?.uuid
    const sameGroup = group && docGroup == base64UrlToString(group)

    // Use select to transform data and control when re-renders happen
    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        fetchNextPage,
        hasNextPage,
        status,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['group', group, isNamesNavOpen, searchQueryString],
        queryFn: async ({ pageParam }) => group ? groupDataQuery(group, searchQueryString, pageParam) : null,

        // Use larger initial size when names navigator is open
        initialPageParam: isNamesNavOpen ? { size: 1000, from: 0 } : { size: 5, from: 0 },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || !lastPage.hits.length) {
                return undefined
            }
            
            const totalFetched = allPages.reduce((sum, page) => sum + (page?.hits?.length || 0), 0)
            const allHits = allPages.flatMap(page => page?.hits || [])
            const totalData = allPages[0]?.total
            const allDataFetched = totalFetched >= (totalData?.value || 0)
            
            // Stop if all data is fetched
            if (allDataFetched) {
                return undefined
            }
            
            // For names navigation, always fetch all data
            if (isNamesNavOpen) {
                const remainingItems = (totalData?.value || 0) - totalFetched
                if (remainingItems <= 0) {
                    return undefined
                }
                const nextSize = Math.min(remainingItems, 1000)
                const nextFrom = totalFetched
                return { size: nextSize, from: nextFrom }
            }
            
            // Regular pagination logic for document view
            const docFound = docUuid && allHits.some((hit: any) => hit._source?.uuid === docUuid)
            const docIndex = docUuid ? allHits.findIndex((hit: any) => hit._source?.uuid === docUuid) : -1
            const isDocLast = docIndex === allHits.length - 1 && docIndex >= 0
            
            // Continue fetching if:
            // 1. Document should be in results but isn't found yet
            // 2. sameGroup is true (continue until total)
            // 3. Document is the last one (fetch one more for next button)
            const shouldContinue = (docUuid && docGroup === group && !docFound) ||
                                  sameGroup ||
                                  isDocLast
            
            if (!shouldContinue) {
                return undefined
            }
            
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
            // Get total from first page since it's the same across all pages
            const totalData = data?.pages?.[0]?.total
            const docFound = docUuid && allHits.some((hit: any) => hit._source?.uuid === docUuid)
            const allDataFetched = !data?.pageParams || allHits.length >= (totalData?.value || 0)
            
            // Always expose data if names navigation is open
            return {
                allHits: allHits,
                totalData: totalData,
                docFound,
                shouldExposeData: isNamesNavOpen || !docUuid || docFound || allDataFetched
            }
        }, [docUuid, isNamesNavOpen]),
        // Only re-render when data actually changes (not on intermediate fetches)
        notifyOnChangeProps: ['data', 'error'],
    })

    // Automatically fetch all pages when names navigation is open
    useEffect(() => {
        if (isNamesNavOpen && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [isNamesNavOpen, hasNextPage, isFetchingNextPage, fetchNextPage])

    return { 
        groupData: processedData?.allHits || [],
        groupTotal: processedData?.totalData || null,
        groupError, 
        groupLoading: groupLoading || (isFetchingNextPage && !processedData?.shouldExposeData),
        fetchMore: fetchNextPage,
        canFetchMore: hasNextPage,
        groupStatus: status
    }
}

