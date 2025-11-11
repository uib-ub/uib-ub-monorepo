'use client'
import { useQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useGroup } from '@/lib/param-hooks';
import { useDebugStore } from '../zustand/debug-store';

const groupDataQuery = async (
    group: string,
    debugChildren?: any[]
) => {
    const newParams= new URLSearchParams();
    newParams.set('group', group);



    console.log("DEBUG CHILDREN NOT USED", debugChildren)
    const res = await fetch(`/api/group?${newParams.toString()}`)

    if (!res.ok) {
        throw new Error('Failed to fetch group')
    }
    const data = await res.json()

    return data
}

export default function useGroupData(overrideGroupCode?: string | null) {
    const { searchQueryString } = useSearchQuery()
    const { activeGroupCode, initCode } = useGroup()
    const groupCode = overrideGroupCode || activeGroupCode

    const debugChildren = useDebugStore((s) => s.debugChildren)
    const debug = useDebugStore((s) => s.debug);

    const {
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        status,
    } = useQuery({
        queryKey: ['group', groupCode, searchQueryString],
        queryFn: async () =>
            groupCode ? groupDataQuery(groupCode, debug ? debugChildren : []) : null,
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
