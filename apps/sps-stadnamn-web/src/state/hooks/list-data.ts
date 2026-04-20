'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import { useDrawerSnap, useInitParam, useGroupParam, useNoGeoOn, usePoint, useResultLimitNumber, useSourceViewOn, useSearchSortParam } from '@/lib/param-hooks';
import { calculateDistance } from '@/lib/map-utils';
import { useSessionStore } from '../zustand/session-store';
import { GlobalContext } from '../providers/global-provider';
import { BATCH_SIZE, STARTING_BATCH_SIZE } from '@/lib/result-limits';
import useAdmContextData from './adm-context-data';

const listDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    init,
    contextAdmPairs,
    selectedGroup,
    point,
    searchSort,
    sourceViewOn,
    noGeo,
    size,
    from,
}: {
    pageParam?: number;
    searchQueryString: string | null;
    init: string | null;
    contextAdmPairs: Array<{ adm1: string; adm2: string }>;
    selectedGroup: string | null;
    point: [number, number] | null;
    searchSort: string | null;
    sourceViewOn: boolean;
    noGeo: boolean;
    size: number;
    from: number;
}) => {

    const sortPoint = !selectedGroup && point ? [point[1], point[0]] as [number, number] : null
    const exclude = init || null
    // In selectedGroup mode, list items are source records, so exclude by uuid.
    const idField = selectedGroup ? 'uuid' : (sourceViewOn ? 'uuid' : 'group.id')

    const res = await fetch(`/api/search/list${searchQueryString ? `?${searchQueryString}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({
            size,
            from,
            sortPoint,
            searchSort,
            noGeo,
            exclude,
            idField,
            selectedGroup,
            contextAdmPairs,
            init,
        })
    })
    if (!res.ok) {
        console.error("Error fetching list data", res.status)
        throw new Error(res.status.toString())
    }
    const data = await res.json()

    // Calculate distances if initLocation exists
    const hits = data.hits?.hits || [];
    if (sortPoint && sortPoint.length === 2) {
        const [initLon, initLat] = sortPoint;
        hits.forEach((hit: any) => {
            const hitLocation = hit.fields?.location?.[0]?.coordinates;
            if (hitLocation && hitLocation.length === 2) {
                const [hitLon, hitLat] = hitLocation;
                const distance = calculateDistance(initLat, initLon, hitLat, hitLon);
                // Add distance to the hit object
                hit.distance = distance;
            }
        });
    }

    console.log(data)

    return {
        data: hits,
        nextCursor: hits.length === size ? pageParam + 1 : undefined
    }
}

export default function useListData() {
    
    const { searchQueryString } = useSearchQuery()
    const point = usePoint()
    const searchSort = useSearchSortParam()
    const noGeo = useNoGeoOn()
    const group = useGroupParam()
    const init = useInitParam()
    const sourceViewOn = useSourceViewOn()
    const resultLimitNumber = useResultLimitNumber()
    const selectedGroup = group ? base64UrlToString(group) : null
    const { contextAdmPairs, admContextStatus } = useAdmContextData()
    const snappedPosition = useDrawerSnap()
    const { isMobile } = useContext(GlobalContext)
    const mobilePreview = Boolean(init && isMobile && snappedPosition == 'bottom')

    // In `noGeo` mode, list sorting relies on adm/cadastre context boosts.
    // Avoid an initial fetch with empty context before `adm-context` has resolved.
    const admContextReady = !noGeo || admContextStatus === 'success' || admContextStatus === 'error'

    // `SearchResults` reserves the last rendered slot for a "Vis meir" CTA (when there are more results).
    // So when `resultLimit` is set, we need to load `resultLimit - 1` actual result items to avoid "mangler".
    const targetLoadedCount =
        typeof resultLimitNumber === 'number' && Number.isFinite(resultLimitNumber)
            ? Math.max(0, resultLimitNumber - 1)
            : null



    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status
    } = useInfiniteQuery({
        queryKey: ['listData', searchQueryString, searchSort, init, group, point, noGeo, sourceViewOn, contextAdmPairs],
        queryFn: ({ pageParam }: { pageParam: number }) => listDataQuery({
            pageParam,
            searchQueryString,
            init,
            contextAdmPairs,
            selectedGroup,
            point,
            searchSort,
            sourceViewOn,
            noGeo,
            // The first page is smaller for performance, so offsets must shift accordingly.
            size: pageParam === 0 ? STARTING_BATCH_SIZE : BATCH_SIZE,
            from: pageParam === 0 ? 0 : STARTING_BATCH_SIZE + (pageParam - 1) * BATCH_SIZE,
        }),
        //placeholderData: (prevData: any) => prevData,
        initialPageParam: 0,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        enabled: !mobilePreview && admContextReady,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const listLoadedCount =
        data?.pages?.reduce((acc: number, page: any) => acc + (page?.data?.length ?? 0), 0) ?? 0

    useEffect(() => {
        if (mobilePreview) return
        if (targetLoadedCount === null) return
        if (status !== 'success') return
        if (!hasNextPage) return
        if (isFetchingNextPage) return
        if (listLoadedCount >= targetLoadedCount) return

        fetchNextPage()
    }, [
        mobilePreview,
        targetLoadedCount,
        status,
        hasNextPage,
        isFetchingNextPage,
        listLoadedCount,
        fetchNextPage,
    ])

    return {
        listData: data,
        listLoadedCount,
        listError: error,
        listFetchNextPage: fetchNextPage,
        listHasNextPage: hasNextPage,
        listIsFetchingNextPage: isFetchingNextPage,
        listFetching: isFetching,
        listLoading: isLoading,
        listStatus: status,
        mobilePreview: mobilePreview,
    }
}




