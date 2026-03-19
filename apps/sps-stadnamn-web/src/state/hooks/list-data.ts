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

export const INITIAL_PAGE_SIZE = 10;
export const SUBSEQUENT_PAGE_SIZE = 20;


const listDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    init,
    selectedGroup,
    point,
    searchSort,
    sourceViewOn,
    noGeo,
}: {
    pageParam?: number;
    searchQueryString: string | null;
    init: string | null;
    selectedGroup: string | null;
    point: [number, number] | null;
    searchSort: string | null;
    sourceViewOn: boolean;
    noGeo: boolean;
}) => {

    // Determine size and from based on page number
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    const sortPoint = !selectedGroup && point ? [point[1], point[0]] as [number, number] : null
    const exclude = init && !selectedGroup ? init : null
    const idField = selectedGroup ? null : (sourceViewOn ? 'uuid' : 'group.id')

    const res = await fetch(`/api/search/list${searchQueryString ? `?${searchQueryString}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({
            size: size,
            from: from,
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

    return {
        data: hits,
        nextCursor: hits.length === size ? pageParam + 1 : undefined
    }
}

export default function useListData() {
    const initialPage = usePageNumber()
    const initialPageRef = useRef(initialPage)
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
            noGeo
        }),
        //placeholderData: (prevData: any) => prevData,
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        enabled: !mobilePreview,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        listData: data,
        listError: error,
        listFetchNextPage: fetchNextPage,
        listHasNextPage: hasNextPage,
        listIsFetchingNextPage: isFetchingNextPage,
        listFetching: isFetching,
        listLoading: isLoading,
        listStatus: status,
        listInitialPage: initialPageRef.current,
        listPageSize: SUBSEQUENT_PAGE_SIZE,
        mobilePreview: mobilePreview,
    }
}




