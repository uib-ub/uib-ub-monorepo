'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useGroupParam, useInitParam, useQParam } from '@/lib/param-hooks';

const resultCardDataQuery = async (
    id: string,
    sourcesQuery: string,
    sourceView: boolean,
) => {
    const newParams = new URLSearchParams(sourcesQuery);
    newParams.set('id', id);
    if (sourceView) {
        newParams.set('sourceView', 'on');
    }

    console.log("DEBUG", newParams.toString());

    const res = await fetch(`/api/card?${newParams.toString()}`);

    if (!res.ok) {
        throw new Error('Failed to fetch group');
    }
    const data = await res.json()

    return data;
};

export default function useResultCardData(itemId?: string | null) {
    const { searchQueryString } = useSearchQuery()
    const init = useInitParam()
    const group = useGroupParam()
    const id = itemId || init || group
    const idDecoded = id && [init, group].includes(id) ? base64UrlToString(id) : id
    const searchParams = useSearchParams()
    const sourceView = searchParams.get('sourceView') === 'on'
    const searchQ = useQParam() || ""
    let sourcesQuery = ""

    if (idDecoded?.startsWith('grunnord_')) {
        //sourcesQuery = searchQ
    }
    else {
        //const newQuery = new URLSearchParams(searchQueryString)
        //newQuery.delete('q')
        //sourcesQuery = newQuery.toString()
        

    }

    const {
        data: rawData,
        error: resultCardError,
        isLoading: resultCardLoading,
        isRefetching: resultCardRefetching,
        isFetching: resultCardFetching,
        status,
    } = useQuery({
        queryKey: ['result-card', sourcesQuery, id, sourceView, searchQueryString],
        queryFn: async () =>
            idDecoded ? resultCardDataQuery(idDecoded, sourcesQuery, sourceView) : null,
        placeholderData: (itemId || init == id) ? undefined : (prevData: any) => prevData,

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
        resultCardData: processedData,
        resultCardTotal: processedData?.total,
        resultCardError,
        resultCardLoading, //|| (isFetchingNextPage && !processedData?.shouldExposeData),
        resultCardRefetching,
        resultCardFetching,
        resultCardStatus: status,
    }
}
