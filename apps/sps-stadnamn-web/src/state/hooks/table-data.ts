'use client'
import { useAscParam, useDescParam, usePageNumber, usePerPageNumber, useWithinParam } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";
import { parseTreeParam } from "@/lib/tree-param";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";



const tableQuery = async ({
    page,
    perPage,
    searchQueryString = '',
    desc = null,
    asc = null,
    within = null

}: {
    page: number;
    perPage: number;
    searchQueryString?: string;
    desc?: string | null;
    asc?: string | null;
    within?: string | null;
}) => {
    // Build URL with already-encoded searchQueryString and additional parameters
    const additionalParams = new URLSearchParams();
    additionalParams.set('size', perPage.toString());
    if (desc) additionalParams.set('desc', desc);
    if (asc) additionalParams.set('asc', asc);
    if (page > 1) additionalParams.set('from', ((page - 1) * perPage).toString());
    if (within) additionalParams.set('within', within);

    // Combine searchQueryString with additional parameters
    const baseUrl = `/api/search/table?${searchQueryString}`;
    const additionalParamsString = additionalParams.toString();
    const fullUrl = additionalParamsString
        ? `${baseUrl}&${additionalParamsString}`
        : baseUrl;

    const res = await fetch(fullUrl);
    if (!res.ok) {
        throw new Error(res.status.toString());
    }
    return await res.json();
};



export default function useTableData() {
    const { searchQueryString } = useSearchQuery()
    const page = usePageNumber()
    const perPage = usePerPageNumber()
    const desc = useDescParam()
    const asc = useAscParam()
    const within = useWithinParam()

    const { data, error, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['tableData', page, perPage, searchQueryString, desc, asc, within],
        queryFn: () => tableQuery({ page, perPage, searchQueryString, desc, asc, within }),
        placeholderData: (prevData) => prevData,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        tableData: data?.hits?.hits || null,
        totalHits: data?.hits?.total || null,
        tableError: error,
        tableLoading: isLoading,
        tableFetching: isFetching,
        tableRefetch: refetch,
        tableUpdatedAt: dataUpdatedAt
    }
}