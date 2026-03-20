'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useContext, useRef } from 'react';
import { useInitParam, useGroupParam, useNoGeoOn, usePoint, useSourceViewOn, useSearchSortParam, usePageParam, usePageNumber } from '@/lib/param-hooks';
import { calculateDistance } from '@/lib/map-utils';
import { useSessionStore } from '../zustand/session-store';
import { GlobalContext } from '../providers/global-provider';
import { BATCH_SIZE, STARTING_BATCH_SIZE } from '@/lib/result-limits';

const listDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    init,
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
    selectedGroup: string | null;
    point: [number, number] | null;
    searchSort: string | null;
    sourceViewOn: boolean;
    noGeo: boolean;
    size: number;
    from: number;
}) => {

    const sortPoint = !selectedGroup && point ? [point[1], point[0]] as [number, number] : null
    const exclude = init && !selectedGroup ? init : null
    const idField = selectedGroup ? null : (sourceViewOn ? 'uuid' : 'group.id')

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
    const selectedGroup = group ? base64UrlToString(group) : null
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { isMobile } = useContext(GlobalContext)
    const mobilePreview = Boolean(init && isMobile && snappedPosition == 'bottom')



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
        queryKey: ['listData', searchQueryString, searchSort, init, group, point, noGeo],
        queryFn: ({ pageParam }: { pageParam: number }) => listDataQuery({
            pageParam,
            searchQueryString: group ? null : searchQueryString,
            init,
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
        enabled: !mobilePreview,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })


    return {
        listData: data,
        listLoadedCount: data?.pages.reduce((acc: number, page: any) => acc + page.data.length, 0),
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




