'use client'
import {
  useGroupParam,
  useInitDecoded,
  useInitParam,
  useNoGeoOn,
  useSearchSortParam,
  useSourceViewOn,
} from "@/lib/param-hooks"
import { base64UrlToString } from "@/lib/param-utils"
import { useSearchQuery } from "@/lib/search-params"
import useAdmContextData from "@/state/hooks/adm-context-data"
import useSearchData from "@/state/hooks/search-data"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

type NavItem = { id: string; point: string | null } // point: "lat,lon"

function extractNavItemsFromSearchResponse(data: any): NavItem[] {
  const hits: any[] = data?.hits?.hits ?? []
  const items: NavItem[] = []
  for (const hit of hits) {
    const id = hit?.fields?.uuid?.[0]
    if (typeof id !== "string" || !id.trim()) continue

    const coords = hit?.fields?.location?.[0]?.coordinates
    const point =
      Array.isArray(coords) &&
      coords.length === 2 &&
      Number.isFinite(Number(coords[0])) &&
      Number.isFinite(Number(coords[1]))
        ? `${coords[1]},${coords[0]}` // [lon, lat] -> "lat,lon"
        : null

    items.push({ id, point })
  }
  return items
}

export function useSubpostNavigation() {
  const sourceViewOn = useSourceViewOn()
  const initParam = useInitParam()
  const initDecoded = useInitDecoded()
  const group = useGroupParam()
  const selectedGroup = group ? base64UrlToString(group) : null
  const noGeo = useNoGeoOn()
  const searchSort = useSearchSortParam()
  const { searchQueryString } = useSearchQuery()
  const { contextAdmPairs, admContextStatus } = useAdmContextData()
  const { docTotalHits } = useSearchData()

  const admContextReady = !noGeo || admContextStatus === "success" || admContextStatus === "error"
  const currentId = sourceViewOn ? initParam : initDecoded
  const isSubpostNavigation = Boolean(sourceViewOn && currentId && selectedGroup)
  const shouldFetchFullList = Boolean(isSubpostNavigation && admContextReady)

  const total = docTotalHits?.value ?? null
  const size = typeof total === "number" && Number.isFinite(total) ? Math.max(0, total) : null

  const fullListQuery = useQuery({
    queryKey: [
      "subpostNavigation",
      searchQueryString,
      searchSort,
      noGeo,
      selectedGroup,
      size,
      JSON.stringify(contextAdmPairs ?? []),
    ],
    enabled: shouldFetchFullList && typeof size === "number" && size > 0,
    queryFn: async () => {
      const res = await fetch(`/api/search/list${searchQueryString ? `?${searchQueryString}` : ""}`, {
        method: "POST",
        body: JSON.stringify({
          size,
          from: 0,
          sortPoint: null,
          searchSort,
          noGeo,
          contextAdmPairs,
          init: currentId,
          exclude: null,
          idField: "uuid",
          selectedGroup,
          sourceViewOn: true,
        }),
      })
      if (!res.ok) throw new Error(`list query failed: ${res.status}`)

      const data = await res.json()
      const items = extractNavItemsFromSearchResponse(data)
      return { items }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const items = fullListQuery.data?.items ?? []
  const { currentIndex, sameCoordinateIds } = useMemo(() => {
    const idx = currentId ? items.findIndex((it) => it.id === currentId) : -1
    if (idx === -1) return { currentIndex: -1, sameCoordinateIds: [] as string[] }
    const currentPoint = items[idx]?.point ?? null
    if (!currentPoint || !currentId) return { currentIndex: idx, sameCoordinateIds: [] as string[] }
    const ids = items.filter((it) => it.point === currentPoint && it.id !== currentId).map((it) => it.id)
    return { currentIndex: idx, sameCoordinateIds: ids }
  }, [currentId, items])

  const prevNext = useMemo(() => {
    if (!currentId || items.length <= 1 || currentIndex < 0) {
      return { prevId: null, nextId: null, prevPoint: null, nextPoint: null }
    }
    const prevItem = items[(currentIndex - 1 + items.length) % items.length]
    const nextItem = items[(currentIndex + 1) % items.length]
    return {
      prevId: prevItem?.id ?? null,
      nextId: nextItem?.id ?? null,
      prevPoint: prevItem?.point ?? null,
      nextPoint: nextItem?.point ?? null,
    }
  }, [currentId, currentIndex, items])

  return {
    isSubpostNavigation,
    currentId,
    items,
    currentIndex,
    sameCoordinateIds,
    sameCoordinateCount: sameCoordinateIds.length,
    isFetching: fullListQuery.isFetching,
    ...prevNext,
  }
}

