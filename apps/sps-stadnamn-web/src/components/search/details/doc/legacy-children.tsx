/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { defaultMaxResultsParam } from '@/config/max-results'
import { stringToBase64Url } from '@/lib/param-utils'
import EmbeddedMap from '@/components/map/embedded-map'

type GroupSummary = { id: string; label?: string; distanceMeters?: number }

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${Math.round(meters / 1000)} km`
}

export default function LegacyChildren({ source }: { source: Record<string, any> }) {
  const children = useMemo(() => {
    const raw = (source as any)?.children ?? (source as any)?.misc?.children
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string' && v.length > 0) : []
  }, [source])
  const sourceLabel = useMemo(() => {
    const label = (source as any)?.label
    return typeof label === 'string' && label.length > 0 ? label : null
  }, [source])
  const sourceCoordinate = useMemo<[number, number] | null>(() => {
    const coords = (source as any)?.location?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return null
    const lon = Number(coords[0])
    const lat = Number(coords[1])
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null
    return [lon, lat]
  }, [source])
  const sourceGroupId = useMemo(() => {
    const id = (source as any)?.group?.id
    return typeof id === 'string' && id.length > 0 ? id : null
  }, [source])

  const [groups, setGroups] = useState<GroupSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setError(null)
        let primaryGroups: GroupSummary[] = []
        if (children.length > 0) {
          const res = await fetch('/api/legacy/children-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ children }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.error || 'REQUEST_FAILED')
          primaryGroups = Array.isArray(data?.groups) ? data.groups : []
        }

        // Second query: run the same search query pattern as search/collapsed
        // using q=<label> and point/initLocation from this item's coordinate.
        // This is strictly a fallback when the first query returns no groups.
        if (primaryGroups.length === 0 && sourceLabel && sourceCoordinate) {
          const [lon, lat] = sourceCoordinate
          const params = new URLSearchParams()
          params.set('q', sourceLabel)
          params.set('point', `${lat},${lon}`)

          const searchRes = await fetch(`/api/search/collapsed?${params.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              size: 5,
              from: 0,
              initLocation: [lon, lat],
            }),
          })
          const searchData = await searchRes.json()
          if (!searchRes.ok) throw new Error(searchData?.error || 'REQUEST_FAILED')

          const fallbackMap = new Map<string, GroupSummary>()
          for (const hit of searchData?.hits?.hits ?? []) {
            const id = hit?.fields?.['group.id']?.[0]
            const label = hit?.fields?.['group.label']?.[0] || hit?.fields?.label?.[0]
            const coords = hit?.fields?.location?.[0]?.coordinates
            if (typeof id !== 'string' || id.length === 0) continue
            if (sourceGroupId && id === sourceGroupId) continue
            const distanceMeters =
              Array.isArray(coords) && coords.length >= 2
                ? calculateDistance(lat, lon, Number(coords[1]), Number(coords[0]))
                : undefined

            if (!fallbackMap.has(id))
              fallbackMap.set(id, {
                id,
                ...(typeof label === 'string' ? { label } : {}),
                ...(typeof distanceMeters === 'number' && Number.isFinite(distanceMeters)
                  ? { distanceMeters }
                  : {}),
              })
          }
          primaryGroups = Array.from(fallbackMap.values()).slice(0, 5)
        }

        if (!cancelled) setGroups(primaryGroups)
      } catch (e: any) {
        if (!cancelled) {
          setGroups(null)
          setError(e?.message || 'REQUEST_FAILED')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [children, sourceCoordinate, sourceGroupId, sourceLabel])

  if (children.length === 0 && !sourceCoordinate) return null

  return (
    <div className="space-y-2">
      <div className="text-sm">
        Oppslag frå det gamle søket på stadnamnportalen.uib.no. 
      </div>
      
      {sourceCoordinate && (
        <EmbeddedMap
          coordinate={[sourceCoordinate[1], sourceCoordinate[0]]}
          zoom={11}
          source={source}
          usePointQuery
          className="rounded-md overflow-hidden"
        />
      )}

      <h2 className="text-lg">Nye oppslag:</h2>

      {error && <div className="text-sm text-red-700">Kunne ikkje hente grupper: {error}</div>}
      {groups === null && !error && <div className="text-sm text-neutral-700">Hentar…</div>}
      {groups?.length === 0 && <div className="text-sm text-neutral-700">Ingen grupper funne.</div>}

      {groups && groups.length > 0 && (
        <div>
          <ul className="!m-0 !p-0 !list-none space-y-1">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2">
                <Link className="no-underline" href={`/search?init=${encodeURIComponent(stringToBase64Url(g.id))}&maxResults=${defaultMaxResultsParam}`}>
                  {g.label || g.id}
                </Link>
                {typeof g.distanceMeters === 'number' && (
                  <span className="bg-neutral-200 text-neutral-900 px-2 rounded-full text-nowrap shrink-0 text-sm">
                    {formatDistance(g.distanceMeters)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}