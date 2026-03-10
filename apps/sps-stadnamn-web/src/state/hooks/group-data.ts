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
    debugChildren?: any[]
) => {
    const newParams = new URLSearchParams(sourcesQuery);
    newParams.set('group', group);

    const res = await fetch(`/api/group?${newParams.toString()}`);

    if (!res.ok) {
        throw new Error('Failed to fetch group');
    }

    const raw = await res.json();

    const rawSources: any[] = raw?.sources ?? [];
    const first = (v: any) => (Array.isArray(v) ? v[0] : v);

    const normalizedSources = rawSources.map((rawSource: any) => {
        const sourceObject = rawSource?._source || rawSource || {};

        const dataset =
            rawSource?._index?.split('-')?.[2] ??
            rawSource?.dataset ??
            (sourceObject as any).dataset;

        const location =
            (sourceObject as any).location ??
            (rawSource as any).location;

        return {
            ...sourceObject,
            dataset,
            uuid: first((sourceObject as any).uuid ?? rawSource.uuid),
            label: first((sourceObject as any).label ?? rawSource.label),
            altLabels: (sourceObject as any).altLabels ?? rawSource.altLabels ?? [],
            year: first((sourceObject as any).year ?? rawSource.year),
            attestations: (sourceObject as any).attestations ?? rawSource.attestations ?? [],
            location,
            recordings: (sourceObject as any).recordings ?? rawSource.recordings ?? [],
            content: (sourceObject as any).content ?? rawSource.content,
            iiif: first((sourceObject as any).iiif ?? rawSource.iiif),
        };
    });

    const datasets: Record<string, any[]> = {};
    normalizedSources.forEach((source) => {
        if (!source.dataset) return;
        if (!datasets[source.dataset]) {
            datasets[source.dataset] = [];
        }
        datasets[source.dataset].push(source);
    });

    const nameToYears: Record<string, Set<string>> = {};
    const nameCounts: Record<string, number> = {};

    const pushNameYear = (name: string | undefined, year: any) => {
        if (!name) return;
        const y = year != null ? String(year) : null;
        nameToYears[name] = nameToYears[name] || new Set<string>();

        if (!y || y.startsWith('0')) {
            nameCounts[name] = (nameCounts[name] || 0) + 1;
            return;
        }

        nameToYears[name].add(y);
        nameCounts[name] = (nameCounts[name] || 0) + 1;
    };

    normalizedSources.forEach((source) => {
        pushNameYear(source.label, source.year);
        if (Array.isArray(source.altLabels)) {
            source.altLabels.forEach((alt: any) =>
                pushNameYear(typeof alt === 'string' ? alt : alt?.label, source.year),
            );
        }
        if (Array.isArray(source.attestations)) {
            source.attestations.forEach((att: any) =>
                pushNameYear(att?.label, att?.year),
            );
        }
    });

    const namesByYear: Record<string, string[]> = {};
    const namesWithoutYear: string[] = [];

    Object.entries(nameToYears).forEach(([name, yearsSet]) => {
        const years = Array.from(yearsSet);
        if (years.length === 0) {
            namesWithoutYear.push(name);
            return;
        }
        const numeric = years
            .map((y) => ({ raw: y, num: Number(y) }))
            .filter((y) => !Number.isNaN(y.num))
            .sort((a, b) => a.num - b.num);
        const earliest = numeric.length ? numeric[0].raw : years.sort()[0];
        namesByYear[earliest] = namesByYear[earliest] || [];
        namesByYear[earliest].push(name);
    });

    Object.keys(namesByYear).forEach((y) => namesByYear[y].sort());

    const yearsOrdered = Object.keys(namesByYear)
        .map((y) => {
            if (typeof y === 'string' && y.startsWith('0')) return y;
            const n = Number(y);
            return Number.isNaN(n) ? y : n;
        })
        .sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0))
        .map(String);

    const coordSet = new Set<string>();
    normalizedSources.forEach((source) => {
        const lat = source.location?.coordinates?.[1];
        const lng = source.location?.coordinates?.[0];
        if (lat != null && lng != null) {
            coordSet.add(`${lat},${lng}`);
        }
    });

    return {
        ...raw,
        normalizedSources,
        datasets,
        nameTimeline: {
            yearsOrdered,
            namesByYear,
            namesWithoutYear,
            nameCounts,
        },
        uniqueCoordinates: Array.from(coordSet),
    };
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
        data: processedData,
        error: groupError,
        isLoading: groupLoading,
        isRefetching: groupRefetching,
        isFetching: groupFetching,
        status,
    } = useQuery({
        queryKey: ['group', sourcesQuery, groupCode, sourceView, overrideGroupCode ? undefined : searchQueryString],
        queryFn: async () =>
            groupCode ? groupDataQuery(groupCode, sourcesQuery, debug ? debugChildren : []) : null,
        placeholderData: (overrideGroupCode || initCode == groupCode) ? undefined : (prevData: any) => prevData,
        enabled: !!groupCode,

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
