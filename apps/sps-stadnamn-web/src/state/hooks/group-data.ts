'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useEffect, useCallback } from 'react';
import { useDocIndex, useGroup } from '@/lib/param-hooks';

const groupDataQuery = async (
    group: string,
    datasets: string[] | null,
    datasetTags: string[] | null,
    pageParam: { size: number; from: number },
) => {
    const newParams= new URLSearchParams();
    newParams.set('group', group);
    newParams.set('size', pageParam.size.toString());
    newParams.set('from', pageParam.from.toString());
    if (datasets) {
        // Add multiple dataset params, as separate keys
        datasets.forEach((ds: string) => newParams.append('dataset', ds));
    }  
    if (datasetTags) {
        // Add multiple datasetTag params, as separate keys
        datasetTags.forEach((tag: string) => newParams.append('datasetTag', tag));
    }
    const res = await fetch(`/api/group?${newParams.toString()}`)
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
    const datasets = searchParams.getAll('dataset')
    const datasetTags = searchParams.getAll('datasetTag')


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
        queryKey: ['group', groupCode, searchQueryString, docIndex],
        queryFn: async ({ pageParam }) =>
            groupCode ? groupDataQuery(groupCode, datasets, datasetTags, pageParam) : null,

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
