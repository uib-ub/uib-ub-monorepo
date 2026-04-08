'use client'

import { useGroupParam, useMode } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import { GlobalContext } from '@/state/providers/global-provider';
import { useQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { stringToBase64Url } from '@/lib/param-utils';

export async function autocompleteQuery(
    searchFilterParamsString: string,
    inputState: string,
    _isMobile: boolean,
    _datasetFilters: [string, string][] = [],
) {
    if (!inputState) return null;

    const newQuery = new URLSearchParams(searchFilterParamsString);
    newQuery.delete('q');
    newQuery.set('q', inputState);
    const autocompleteQuery = newQuery.toString();

    const res = await fetch(`/api/autocomplete?${autocompleteQuery}&size=20`);
    if (!res.ok) {
        throw new Error(res.status.toString());
    }
    const data = await res.json();
    return data;
}

export function buildAutocompleteQueryStringFromHit(hit: any): string {
    const label = hit?.fields?.label?.[0]?.trim() || '';
    return label;
}

export function getAutocompleteSelection(
    rankedHits: any[],
    index: number,
): {
    inputString: string;
    group: string | null;
    coordinates?: [number, number];
} | null {
    if (!rankedHits.length) return null;

    // Index 0 is the "search for exactly this label" option.
    if (index === 0) {
        const label = rankedHits[0]?.fields?.label?.[0];
        if (!label) return null;
        return {
            inputString: label,
            group: null,
            coordinates: undefined,
        };
    }

    const hit = rankedHits[index - 1];
    if (!hit) return null;

    const inputString = buildAutocompleteQueryStringFromHit(hit);
    const rawGroupId = hit.fields?.['group.id']?.[0] ?? null;
    const group = rawGroupId ? stringToBase64Url(rawGroupId) : null;
    const coords = hit.fields?.location?.[0]?.coordinates;

    return {
        inputString,
        group,
        coordinates: coords,
    };
}

export default function useAutocompleteData(inputState: string) {
    const { isMobile } = useContext(GlobalContext);
    const { datasetFilters, searchFilterParamsString } = useSearchQuery();
    const mode = useMode();
    const isTableMode = mode === 'table';
    const group = useGroupParam();
    
    const queryResult = useQuery({
        queryKey: ['autocomplete', inputState, datasetFilters, isTableMode],
        enabled: !group && !isTableMode && !!inputState.trim(),
        placeholderData: (prevData: any) => prevData,
        queryFn: () =>
            autocompleteQuery(
                searchFilterParamsString,
                inputState,
                isMobile,
                datasetFilters,
            ),
    });

    const rankedHits = useMemo(() => {
        const hits: any[] = (queryResult.data as any)?.hits?.hits || [];
        const q = (inputState || '').trim().toLowerCase();
        if (!q || !hits.length) return hits;
        const startsWithNumber = /^\d/.test(q);
        const normalizedCadastrePrefix = q.replace(/[/-]+$/g, '');

        const parts = q.split(/\s+/).filter(Boolean);
        const lastToken = parts[parts.length - 1] || '';
        const firstPart = parts.slice(0, -1).join(' ').trim();

        const firstLower = firstPart.toLowerCase();
        const lastLower = lastToken.toLowerCase();

        return [...hits]
            .map((hit) => {
                const label: string = hit.fields?.label?.[0] || '';
                const adm2: string =
                    hit.fields?.adm2?.[0] ||
                    hit.fields?.['group.adm2']?.[0] ||
                    '';
                const cadastrePath: string =
                    hit.fields?.['cadastreText.path']?.[0] || '';

                const labelLc = label.toLowerCase();
                const adm2Lc = adm2.toLowerCase();
                const cadastreLc = cadastrePath.toLowerCase();

                let score = 0;

                if (labelLc === q) score += 1000;

                if (
                    firstLower &&
                    labelLc === firstLower &&
                    lastLower &&
                    adm2Lc === lastLower
                ) {
                    score += 900;
                }

                if (firstLower && labelLc === firstLower) score += 400;

                if (lastLower && adm2Lc === lastLower) score += 300;

                if (firstLower && labelLc.startsWith(firstLower)) score += 200;
                if (lastLower && adm2Lc.startsWith(lastLower)) score += 150;

                if (startsWithNumber && cadastreLc) {
                    if (cadastreLc === q) score += 5000;

                    if (
                        normalizedCadastrePrefix &&
                        normalizedCadastrePrefix !== q &&
                        cadastreLc === normalizedCadastrePrefix
                    ) {
                        score += 4500;
                    }

                    if (cadastreLc.startsWith(q)) score += 1800;
                    if (
                        normalizedCadastrePrefix &&
                        normalizedCadastrePrefix !== q &&
                        cadastreLc.startsWith(normalizedCadastrePrefix)
                    ) {
                        score += 1600;
                    }
                }

                score -= label.length * 0.01;

                return { ...hit, __clientScore: score };
            })
            .sort(
                (a, b) => (b.__clientScore ?? 0) - (a.__clientScore ?? 0),
            );
    }, [queryResult.data, inputState]);

    return {
        ...queryResult,
        rankedHits,
    };
}

