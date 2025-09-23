'use client'
import { useQuery } from '@tanstack/react-query'

export type IIIFNeighboursResult = {
	data: {
		first: string | null
		previous: string | null
		next: string | null
		neighbours: any[]
		last: string | null
	} | null
	total: number
	status?: number
}

async function fetchNeighbours(order: number, partOf: string): Promise<IIIFNeighboursResult> {
	const params = new URLSearchParams({ order: String(order), partOf })
	const res = await fetch(`/api/iiif/neighbours?${params.toString()}`)
	if (!res.ok) throw new Error('Failed to fetch neighbours')
	return res.json()
}

export function useIIIFNeighbours(order?: number, partOf?: string) {
	const enabled = typeof order === 'number' && !!partOf
	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: ['iiifNeighbours', order, partOf],
		queryFn: () => fetchNeighbours(order as number, partOf as string),
		enabled,
		placeholderData: (prev) => prev,
		staleTime: 1000 * 60 * 5,
	})
	return {
		neighbours: data || { data: null, total: 0 },
		neighboursLoading: isLoading,
		neighboursFetching: isFetching,
		neighboursError: error as Error | null,
	}
}


