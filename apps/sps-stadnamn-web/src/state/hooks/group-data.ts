'use client'
import { useGroup } from '@/lib/param-hooks';
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useDebugStore } from '../zustand/debug-store';

const groupDataQuery = async (
    group: string,
    sourcesQuery: string,
    sourceView: boolean,
) => {
    const newParams = new URLSearchParams(sourcesQuery);
    newParams.set('group', group);
    if (sourceView) {
        newParams.set('sourceView', 'on');
    }

    const res = await fetch(`/api/group?${newParams.toString()}`);

    if (!res.ok) {
        throw new Error('Failed to fetch group');
    }
    const data = await res.json()

    return data;
};

export default function useGroupData(overrideGroupCode?: string | null) {
    const { searchQueryString } = useSearchQuery()
    const { activeGroupCode, initCode } = useGroup()
    const groupCode = overrideGroupCode || activeGroupCode
    const groupValue = groupCode ? base64UrlToString(groupCode) : null
    const searchParams = useSearchParams()
    const sourceView = searchParams.get('sourceView') === 'on'

    const debugChildren = useDebugStore((s) => s.debugChildren)
    const debug = useDebugStore((s) => s.debug);
    const searchQ = searchParams.get('q') || ""
    let sourcesQuery = ""

    if (groupValue && base64UrlToString(groupValue).startsWith('grunnord_')) {
        sourcesQuery = searchQ
    }
    else {
        //const newQuery = new URLSearchParams(searchQueryString)
        //newQuery.delete('q')
        //sourcesQuery = newQuery.toString()
        

    }

    const {
        data: rawData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        status,
    } = useQuery({
        queryKey: ['group', sourcesQuery, groupCode, sourceView, overrideGroupCode ? undefined : searchQueryString],
        queryFn: async () =>
            groupCode ? groupDataQuery(groupCode, sourcesQuery, sourceView) : null,
        placeholderData: (overrideGroupCode || initCode == groupCode) ? undefined : (prevData: any) => prevData,

    })

    // Normalize the shape so existing components can rely on
    // `groupData.label` and `groupData.coordinates` even if the API
    // response only exposes these via `fields`/`sources`.
    const processedData = rawData
        ? {
            ...rawData,
            label:
                (rawData as any).label
                ?? (rawData as any).fields?.label?.[0]
                ?? (rawData as any).fields?.["group.label"]?.[0]
                ?? undefined,
            coordinates:
                (rawData as any).coordinates
                ?? (Array.isArray((rawData as any).fields?.location?.coordinates)
                    ? (rawData as any).fields.location.coordinates
                    : Array.isArray((rawData as any).sources?.[0]?.location?.coordinates)
                        ? (rawData as any).sources[0].location.coordinates
                        : undefined),
        }
        : null

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
