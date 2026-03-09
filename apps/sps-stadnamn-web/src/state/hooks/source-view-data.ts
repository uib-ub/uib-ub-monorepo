'use client'
import { calculateDistance } from '@/lib/map-utils';
import { usePoint } from '@/lib/param-hooks';
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { parseTreeParam } from '@/lib/tree-param';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export const INITIAL_PAGE_SIZE = 10;
export const SUBSEQUENT_PAGE_SIZE = 40;

const sourceViewQuery = async ({
    pageParam = 0,
    searchQueryString,
    searchSort,
    point,
    within,
    group,
}: {
    pageParam?: number;
    searchQueryString: string;
    searchSort: string | null;
    point: [number, number] | null;
    within: string | null;
    group: string | null;
}) => {
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    const params = new URLSearchParams(searchQueryString);
    params.delete('sourceView');
    params.set('size', size.toString());
    params.set('from', from.toString());
    if (searchSort) params.set('searchSort', searchSort);
    if (point) params.set('point', `${point[0]},${point[1]}`);
    if (within) params.set('within', within);
    if (group) params.set('group', group);

    const res = await fetch(`/api/search/table?${params.toString()}`);
    if (!res.ok) {
        throw new Error(res.status.toString());
    }

    const data = await res.json();
    const hits = data?.hits?.hits || [];

    if (point) {
        const [initLat, initLon] = point;
        hits.forEach((hit: any) => {
            const hitLocation = hit._source?.location?.coordinates || hit.fields?.location?.[0]?.coordinates;
            if (hitLocation && hitLocation.length === 2) {
                const [hitLon, hitLat] = hitLocation;
                hit.distance = calculateDistance(initLat, initLon, hitLat, hitLon);
            }
        });
    }

    return {
        data: hits,
        nextCursor: hits.length === size ? pageParam + 1 : undefined,
    };
};

export default function useUngroupedData() {
    const { searchQueryString } = useSearchQuery();
    const searchParams = useSearchParams();
    const initialPage = parseInt(searchParams.get('page') || '1');
    const initialPageRef = useRef(initialPage);
    const searchSort = searchParams.get('searchSort');
    const point = usePoint();
    const tree = searchParams.get('tree');
    const doc = searchParams.get('doc');
    const treeUuid = parseTreeParam(searchParams.get('tree')).uuid;
    const cadastreDoc = tree ? (treeUuid || doc) : null;
    const sourceView = searchParams.get('sourceView') === 'on';
    const group = searchParams.get('group');

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status,
    } = useInfiniteQuery({
        queryKey: ['sourceViewData', searchQueryString, searchSort, point, cadastreDoc],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            sourceViewQuery({
                pageParam,
                searchQueryString,
                searchSort,
                point,
                within: cadastreDoc,
                group,
            }),
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: sourceView,
        staleTime: 1000 * 60 * 5,
    });

    return {
        sourceViewData: data,
        sourceViewError: error,
        sourceViewFetchNextPage: fetchNextPage,
        sourceViewHasNextPage: hasNextPage,
        sourceViewIsFetchingNextPage: isFetchingNextPage,
        sourceViewFetching: isFetching,
        sourceViewLoading: isLoading,
        sourceViewStatus: status,
        sourceViewInitialPage: initialPageRef.current,
    };
}
