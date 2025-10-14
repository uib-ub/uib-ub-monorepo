'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useRef } from 'react';
import useGroupData from './group-data';
import { extractFacets } from '@/app/api/_utils/facets';
import { base64UrlToString } from '@/lib/param-utils';

const INITIAL_PAGE_SIZE = 10;
const SUBSEQUENT_PAGE_SIZE = 30;

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
    initBoost,
    initPlaceScore,
    initGroupData,

}: { pageParam?: number; searchQueryString: string, initGroupCode: string | null, initBoost: number | null, initPlaceScore: number | null, initGroupData: Record<string, any> | null }) => {      
    
    // Determine size and from based on page number
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    console.log(`📄 Fetching page ${pageParam}:`, { isFirstPage, size, from, expectedRange: `${from}-${from + size - 1}` });

    const initGroupValue = initGroupCode ? base64UrlToString(initGroupCode) : undefined
    const initLocation = initGroupData?.sources[0]?.location?.coordinates || undefined
    const initLabel = initGroupData?.sources[0]?.label || undefined

    const res = await fetch(`/api/search/collapsed?${searchQueryString}`, {
        method: 'POST',
        body: JSON.stringify({
            size: size,
            from: from,
            //initGroupValue: initGroupValue,
            initBoost: initGroupData?.boost,
            initPlaceScore: initGroupData?.placeScore,
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
    const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(initGroupCode)
    
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
        queryKey: ['collapsedData', searchQueryString, initGroupLoading, initGroupCode],
        queryFn: ({ pageParam }) => collapsedDataQuery({ 
            pageParam, 
            searchQueryString,
            initGroupCode: initGroupCode,
            initBoost: initGroupCode ? initGroupData?.boost : null,
            initPlaceScore: initGroupCode ? initGroupData?.placeScore : null,
            initGroupData: initGroupCode ? initGroupData : null,
        }),
        placeholderData: (prevData) => prevData,
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
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




