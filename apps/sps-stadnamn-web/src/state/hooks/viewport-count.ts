'use client'

import { useSearchQuery } from "@/lib/search-params"
import { useQuery } from "@tanstack/react-query"

export type ViewportBounds = [[number, number], [number, number]] // [[north, west], [south, east]]

export default function useViewportCount(bounds: ViewportBounds | null) {
  const { searchQueryString } = useSearchQuery()

  const enabled = Boolean(bounds && bounds.length === 2)

  const { data, error, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['viewportCount', searchQueryString, bounds],
    enabled,
    queryFn: async () => {
      if (!bounds) return null
      const [[north, west], [south, east]] = bounds
      const qs = new URLSearchParams(searchQueryString)
      qs.set('north', String(north))
      qs.set('west', String(west))
      qs.set('south', String(south))
      qs.set('east', String(east))

      const res = await fetch(`/api/viewport-count?${qs.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to fetch viewport count')
      }
      return await res.json()
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 15,
  })

  const viewportGroupCount = data?.aggregations?.groups?.value ?? null
  const viewportDocCount = data?.hits?.total?.value ?? data?.hits?.total ?? null

  return {
    viewportGroupCount,
    viewportDocCount,
    viewportCountError: error,
    viewportCountLoading: isLoading,
    viewportCountUpdatedAt: dataUpdatedAt,
  }
}

