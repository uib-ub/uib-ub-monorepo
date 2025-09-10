'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useEffect, useCallback } from 'react';
import { useDocIndex, useGroup } from '@/lib/param-hooks';

const groupDataQuery = async (
    group: string,
    searchQueryString: string,
    pageParam: { size: number; from: number },
    includeFilters: boolean
) => {
    const res = await fetch(
        `/api/group?${includeFilters ? `${searchQueryString}&` : ''}group=${group}&size=${pageParam.size}&from=${pageParam.from}`
    )
    if (!res.ok) {
        throw new Error('Failed to fetch group')
    }
    const data = await res.json()

    return {
        hits: data.hits?.hits || [],
        total: data.hits?.total,
        size: pageParam.size,
        from: pageParam.from,
        aggregations: data.aggregations || null,
    }
}

export default function useGroupData() {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const { groupCode } = useGroup()
    const details = searchParams.get('details')

    const includeFilters = (!details || details == 'group')

    // docIndex is now the driver (instead of docUuid)
    const docIndex = useDocIndex()

    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        fetchNextPage,
        hasNextPage,
        refetch,
        status,
    } = useInfiniteQuery({
        queryKey: ['group', groupCode, searchQueryString, includeFilters, docIndex],
        queryFn: async ({ pageParam }) =>
            groupCode ? groupDataQuery(groupCode, searchQueryString, pageParam, includeFilters) : null,

        // Use larger initial size when docIndex is 4 or more
        initialPageParam: { size: docIndex >= 4 ? 1000 : docIndex + 5, from: 0 },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || !lastPage.hits.length) return undefined

            const totalFetched = allPages.reduce(
                (sum, page) => sum + (page?.hits?.length || 0),
                0
            )
            const totalData = allPages[0]?.total
            const allDataFetched = totalFetched >= (totalData?.value || 0)

            if (allDataFetched) return undefined

            // When docIndex is 4 or more, fetch all remaining data
            if (docIndex >= 4) {
                const remainingItems = (totalData?.value || 0) - totalFetched
                return { size: remainingItems, from: totalFetched }
            }

            // Otherwise keep the existing behavior
            const nextSize = Math.min(lastPage.size * 2, 100)
            return { size: nextSize, from: totalFetched }
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (prevData) => prevData,
        // Transform data and expose only when ready
        select: useCallback(
            (data: any) => {
                const allHits = data?.pages?.flatMap((page: any) => page?.hits || []) || []
                const totalData = data?.pages?.[0]?.total


                // Get viewport from the first page (which has aggregations)
                const viewport = data?.pages?.[0]?.aggregations?.viewport?.bounds || null

                return {
                    allHits,
                    totalData,
                    viewport,
                    shouldExposeData: true, // Always expose data since we handle pagination differently now
                }
            },
            []
        ),
    })

    // Add effect to handle docIndex changes
    useEffect(() => {
        if (docIndex >= 4) {
            refetch()
        }
    }, [docIndex, refetch])


    return {
        groupData: processedData?.allHits || [],
        groupTotal: processedData?.totalData || null,
        groupLabel: processedData?.allHits?.[0]?._source?.label || null,
        groupDoc: processedData?.allHits?.[0] || null,
        groupViewport: processedData?.viewport || null,
        groupError,
        groupLoading, //|| (isFetchingNextPage && !processedData?.shouldExposeData),
        groupRefetching,
        groupFetching,
        fetchMore: fetchNextPage,
        canFetchMore: hasNextPage,
        groupStatus: status,
    }
}
