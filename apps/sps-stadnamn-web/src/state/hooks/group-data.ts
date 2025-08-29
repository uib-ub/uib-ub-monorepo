'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useEffect, useCallback } from 'react';
import { useDocIndex, useGroup } from '@/lib/param-hooks';

const groupDataQuery = async (
    group: string,
    searchQueryString: string,
    pageParam: { size: number; from: number }
) => {
    const res = await fetch(
        `/api/search/group?${searchQueryString}&group=${group}&size=${pageParam.size}&from=${pageParam.from}`
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
    }
}

export default function useGroupData() {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const { groupCode } = useGroup()
    const namesNav = searchParams.get('namesNav')

    // Check if names navigator is open
    const isNamesNavOpen = !!namesNav

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
        status,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['group', groupCode, isNamesNavOpen, searchQueryString, docIndex],
        queryFn: async ({ pageParam }) =>
            groupCode ? groupDataQuery(groupCode, searchQueryString, pageParam) : null,

        // Use larger initial size when names navigation is open
        initialPageParam: isNamesNavOpen
            ? { size: 1000, from: 0 }
            : { size: docIndex + 2, from: 0 },

        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || !lastPage.hits.length) return undefined

            const totalFetched = allPages.reduce(
                (sum, page) => sum + (page?.hits?.length || 0),
                0
            )
            const totalData = allPages[0]?.total
            const allDataFetched = totalFetched >= (totalData?.value || 0)

            if (allDataFetched) return undefined

            // ✅ Names navigation: fetch everything
            if (isNamesNavOpen) {
                const remainingItems = (totalData?.value || 0) - totalFetched
                if (remainingItems <= 0) return undefined
                const nextSize = Math.min(remainingItems, 1000)
                return { size: nextSize, from: totalFetched }
            }

            // ✅ Regular doc view: fetch until we reach docIndex
            if (docIndex != null && totalFetched <= docIndex) {
                const nextSize = Math.min(lastPage.size * 2, 100)
                return { size: nextSize, from: totalFetched }
            }

            return undefined
        },

        enabled: !!groupCode,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: (prevData) => prevData,
        // Transform data and expose only when ready
        select: useCallback(
            (data: any) => {
                const allHits =
                    data?.pages?.flatMap((page: any) => page?.hits || []) || []
                const totalData = data?.pages?.[0]?.total
                const allDataFetched =
                    !data?.pageParams || allHits.length >= (totalData?.value || 0)

                return {
                    allHits,
                    totalData,
                    shouldExposeData:
                        isNamesNavOpen || allHits.length > docIndex || allDataFetched,
                }
            },
            [docIndex, isNamesNavOpen]
        ),

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
        groupLoading, //|| (isFetchingNextPage && !processedData?.shouldExposeData),
        groupRefetching,
        groupFetching,
        fetchMore: fetchNextPage,
        canFetchMore: hasNextPage,
        groupStatus: status,
    }
}
