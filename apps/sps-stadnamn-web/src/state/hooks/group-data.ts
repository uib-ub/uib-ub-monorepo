'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useEffect, useCallback, useContext } from 'react';
import { useDocIndex, useGroup } from '@/lib/param-hooks';
import { useDebugStore } from '../zustand/debug-store';
import { GlobalContext } from '../providers/global-provider';
import { base64UrlToString } from '@/lib/param-utils';

const groupDataQuery = async (
    group: string,
    datasets: string[] | null,
    datasetTags: string[] | null,
    debugChildren?: any[]
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
    let res 

    console.log("DEBUG CHILDREN BEFORE", debugChildren)

    if (debugChildren) {
        console.log("DEBUG CHILDREN", debugChildren)
        res = await fetch(`/api/group`,
        {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({debugChildren: debugChildren, groupId: base64UrlToString(group) })
          }
        
        )



    }
    else {
        console.log("USING GET (CLIENT)",debugChildren )
        res = await fetch(`/api/group?${newParams.toString()}`, {
            method: 'GET'
        })
    }

    if (!res.ok) {
        throw new Error('Failed to fetch group')
    }
    const data = await res.json()

    return data
}

export default function useGroupData(overrideGroupCode?: string | null) {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const { activeGroupCode, initCode } = useGroup()
    const groupCode = overrideGroupCode || activeGroupCode

    const datasets = searchParams.getAll('dataset')
    const datasetTags = searchParams.getAll('datasetTag')
    const debugChildren = useDebugStore((s) => s.debugChildren)
    const { debug } = useContext(GlobalContext)

    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        status,
    } = useQuery({
        queryKey: ['group', groupCode, searchQueryString, debugChildren],
        queryFn: async () =>
            groupCode ? groupDataQuery(groupCode, datasets, datasetTags, debugChildren) : null,
        placeholderData: (overrideGroupCode || initCode == groupCode) ? undefined : (prevData: any) => prevData,

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
