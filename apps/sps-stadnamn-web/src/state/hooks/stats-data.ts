import { useQuery } from "@tanstack/react-query"


const statsQuery = async () => {
    const res = await fetch(`/api/stats`)
    if (!res.ok) {
        throw new Error('Failed to fetch stats')
    }
    const data = await res.json()
    return data
}


export default function useStatsData() {
    const { data, error, isLoading, dataUpdatedAt } = useQuery({
        queryKey: ['statsData'],
        placeholderData: (prevData: any) => prevData,
        queryFn: async () => statsQuery(),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
    return { 
        statsData: data || null, 
        iiifStats: data?.iiifStats || null,
        statsError: error, 
        statsLoading: isLoading, 
        statsUpdatedAt: dataUpdatedAt 
    }
}


