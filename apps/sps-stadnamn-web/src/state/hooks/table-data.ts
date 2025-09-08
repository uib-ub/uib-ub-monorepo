import { useSearchQuery } from "@/lib/search-params";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";



const tableQuery = async ({
    page = 1,
    perPage = 10,
    searchQueryString = '',
    desc = null,
    asc = null
}: {
    page?: number;
    perPage?: number;
    searchQueryString?: string;
    desc?: string | null;
    asc?: string | null;
}) => {
    // Build URL with already-encoded searchQueryString and additional parameters
    const additionalParams = new URLSearchParams();
    additionalParams.set('size', perPage.toString());
    if (desc) additionalParams.set('desc', desc);
    if (asc) additionalParams.set('asc', asc);
    if (page > 1) additionalParams.set('from', ((page - 1) * perPage).toString());

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

    const {searchQueryString } = useSearchQuery()
    const searchParams = useSearchParams()
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const perPage = searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 10
    const desc = searchParams.get('desc')
    const asc = searchParams.get('asc')

    const { data, error, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['tableData', page, perPage, searchQueryString, desc, asc],
        queryFn: () => tableQuery({ page, perPage, searchQueryString, desc, asc }),
        placeholderData : (prevData) => prevData,
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