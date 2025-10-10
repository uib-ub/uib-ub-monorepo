'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useEffect, useCallback } from 'react';
import { useDocIndex, useGroup } from '@/lib/param-hooks';

const groupDataQuery = async (
    group: string,
    datasets: string[] | null,
    datasetTags: string[] | null,
) => {
    const newParams= new URLSearchParams();
    newParams.set('group', group);
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

    return data
}

export default function useGroupData(overrideGroupCode?: string | null) {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const { groupCode } = useGroup()
    const group = overrideGroupCode || groupCode

    const datasets = searchParams.getAll('dataset')
    const datasetTags = searchParams.getAll('datasetTag')

    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        status,
    } = useQuery({
        queryKey: ['group', group, searchQueryString],
        queryFn: async ({ pageParam }) =>
            group ? groupDataQuery(group, datasets, datasetTags) : null,
        placeholderData: overrideGroupCode ? undefined : (prevData) => prevData,
        // Transform data and expose only when ready
    })



    return {
        groupData: processedData,
        groupTotal: processedData?.total,
        groupError,
        groupLoading, //|| (isFetchingNextPage && !processedData?.shouldExposeData),
        groupRefetching,
        groupFetching,
        groupStatus: status,
    }
}
