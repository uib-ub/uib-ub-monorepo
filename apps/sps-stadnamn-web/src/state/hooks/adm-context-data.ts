'use client'

import { useInitParam, useNoGeoOn, usePointParam } from '@/lib/param-hooks'
import { useQuery } from '@tanstack/react-query'

export type AdmPair = { adm1: string; adm2: string }

type AdmContextAggResponse = {
  aggs?: {
    adm1?: {
      buckets?: Array<{
        key: string
        adm2?: { buckets?: Array<{ key: string }> }
      }>
    }
  }
}

async function fetchAdmContext(queryString: string) {
  const res = await fetch(`/api/adm-context?${queryString}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch adm context (${res.status})`)
  }
  return res.json() as Promise<AdmContextAggResponse>
}

export default function useAdmContextData() {
  // init is intentionally ignored: context is derived only from `point`
  useInitParam()
  const point = usePointParam()
  const noGeoOn = useNoGeoOn()

  const finalQueryString = point ? `point=${encodeURIComponent(point)}` : ''

  const { data, error, isLoading, status } = useQuery({
    queryKey: ['adm-context', point],
    queryFn: () => fetchAdmContext(finalQueryString),
    enabled: Boolean(noGeoOn && point),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const buckets = data?.aggs?.adm1?.buckets ?? []
  const contextAdmPairs: Array<{ adm1: string; adm2: string }> = []
  const seenPairs = new Set<string>()

  for (const b of buckets) {
    const adm1 = typeof b?.key === 'string' ? b.key.trim() : ''
    if (!adm1) continue
    const adm2Buckets = b?.adm2?.buckets ?? []
    for (const cb of adm2Buckets) {
      const adm2 = typeof cb?.key === 'string' ? cb.key.trim() : ''
      if (!adm2) continue
      const key = `${adm1}__${adm2}`
      if (seenPairs.has(key)) continue
      seenPairs.add(key)
      contextAdmPairs.push({ adm1, adm2 })
    }
  }
  return {
    contextAdmPairs,
    admContextError: error,
    admContextLoading: isLoading,
    admContextStatus: status,
  }
}

