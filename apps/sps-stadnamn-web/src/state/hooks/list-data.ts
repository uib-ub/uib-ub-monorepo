'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import useGroupData from './group-data';
import { usePoint } from '@/lib/param-hooks';
import { calculateDistance } from '@/lib/map-utils';

export const INITIAL_PAGE_SIZE = 10;
export const SUBSEQUENT_PAGE_SIZE = 20;


const listDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    initGroupData,
    initValue,
    point,
    searchSort,
    collapsed,
    includeGroup,
    includeNoLocation,
}: {
    pageParam?: number;
    searchQueryString: string;
    initGroupCode: string | null;
    initGroupData: Record<string, any> | null;
    initValue: string | null;
    point: [number, number] | null;
    searchSort: string | null;
    collapsed: boolean;
    includeGroup: boolean;
    includeNoLocation: boolean;
}) => {

    // Determine size and from based on page number
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    // `location` in Elasticsearch is stored as [lon, lat].
    // Group data already uses that order, but `point` from the URL is [lat, lon],
    // so we need to flip it before sending it as `initLocation`.
    const initLocation =
        initGroupData?.coordinates ||
        (point ? [point[1], point[0]] as [number, number] : null)
    const initLabel = initGroupData?.label || undefined

    const res = await fetch(`/api/search/list${searchQueryString ? `?${searchQueryString}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({
            size: size,
            from: from,
            initLocation,
            initLabel,
            searchSort,
            collapsed,
            init: initValue,
            includeGroup,
            includeNoLocation,
        })
    })
    if (!res.ok) {
        console.error("Error fetching list data", res.status)
        throw new Error(res.status.toString())
    }
    const data = await res.json()

    // Calculate distances if initLocation exists
    const hits = data.hits?.hits || [];
    if (initLocation && initLocation.length === 2) {
        const [initLon, initLat] = initLocation;
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
    const searchParams = useSearchParams()
    const initialPage = parseInt(searchParams.get('page') || '1')
    const initialPageRef = useRef(initialPage)
    const { searchQueryString } = useSearchQuery()
    const initGroupCode = searchParams.get('init')
    const point = usePoint()
    const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(initGroupCode)
    const searchSort = searchParams.get('searchSort')
    const collapsed = searchParams.get('sourceView') != 'on'
    const includeGroup = Boolean(!collapsed && searchParams.get('group'))
    const includeNoLocation = searchParams.get('noLocation') === 'on'

    // Decode `init` once for the list API body. If it's valid base64, use the
    // decoded value; otherwise, fall back to the raw value (UUID in source view).
    let decodedInit: string | null = null
    if (initGroupCode) {
        try {
            decodedInit = base64UrlToString(initGroupCode)
        } catch {
            decodedInit = initGroupCode
        }
    }

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
        queryKey: ['listData', searchQueryString, searchSort, collapsed, initGroupLoading, initGroupCode, point, includeNoLocation],
        queryFn: ({ pageParam }: { pageParam: number }) => listDataQuery({
            pageParam,
            searchQueryString,
            initGroupCode: initGroupCode,
            initGroupData: initGroupCode ? initGroupData : null,
            initValue: decodedInit,
            point,
            searchSort,
            collapsed,
            includeGroup,
            includeNoLocation,
        }),
        //placeholderData: (prevData: any) => prevData,
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !initGroupLoading,
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
        initGroupData: initGroupData,
        initGroupLoading: initGroupLoading,
        listPageSize: SUBSEQUENT_PAGE_SIZE,


    }
}




