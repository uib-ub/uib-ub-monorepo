'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import useGroupData from './group-data';
import { usePoint } from '@/lib/param-hooks';

export const INITIAL_PAGE_SIZE = 10;
export const SUBSEQUENT_PAGE_SIZE = 40;

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const collapsedDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    initGroupCode,
    initGroupData,
    point,
}: { pageParam?: number; searchQueryString: string, initGroupCode: string | null, initGroupData: Record<string, any> | null, point: [number, number] | null }) => {

    // Determine size and from based on page number
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    console.log(`📄 Fetching page ${pageParam}:`, { isFirstPage, size, from, expectedRange: `${from}-${from + size - 1}` });


    // `location` in Elasticsearch is stored as [lon, lat].
    // Group data already uses that order, but `point` from the URL is [lat, lon],
    // so we need to flip it before sending it as `initLocation`.
    const initLocation =
        initGroupData?.fields?.location?.[0]?.coordinates ||
        (point ? [point[1], point[0]] as [number, number] : null)
    const initLabel = initGroupData?.sources[0]?.label || undefined

    const res = await fetch(`/api/search/collapsed?${searchQueryString}`, {
        method: 'POST',
        body: JSON.stringify({
            size: size,
            from: from,
            //initGroupValue: initGroupValue,
            initLocation,
            initLabel,

        })
    })
    if (!res.ok) {
        console.error("Error fetching collapsed data", res.status)
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

export default function useCollapsedData() {
    const searchParams = useSearchParams()
    const initialPage = parseInt(searchParams.get('page') || '1')
    const initialPageRef = useRef(initialPage)
    const { searchQueryString } = useSearchQuery()
    const initGroupCode = searchParams.get('init')
    const point = usePoint()
    const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(initGroupCode)
    const searchSort = searchParams.get('searchSort')
    const effectiveSearchQueryString = searchSort
        ? `${searchQueryString}${searchQueryString ? '&' : ''}searchSort=${searchSort}`
        : searchQueryString

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
        queryKey: ['collapsedData', searchQueryString, searchSort, initGroupLoading, initGroupCode, point],
        queryFn: ({ pageParam }: { pageParam: number }) => collapsedDataQuery({
            pageParam,
            searchQueryString: effectiveSearchQueryString,
            initGroupCode: initGroupCode,
            initGroupData: initGroupCode ? initGroupData : null,
            point
        }),
        //placeholderData: (prevData: any) => prevData,
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !initGroupLoading,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        collapsedData: data,
        collapsedError: error,
        collapsedFetchNextPage: fetchNextPage,
        collapsedHasNextPage: hasNextPage,
        isFetchingNextPage: isFetchingNextPage,
        collapsedFetching: isFetching,
        collapsedLoading: isLoading,
        collapsedStatus: status,
        collapsedInitialPage: initialPageRef.current,
        initGroupData: initGroupData,
        initGroupLoading: initGroupLoading,


    }
}




