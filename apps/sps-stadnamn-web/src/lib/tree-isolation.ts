'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSessionStore } from '@/state/zustand/session-store'

const PRESERVE_ON_OPEN = ['zoom', 'center', 'mode'] as const

function buildTreeSearchParams(current: URLSearchParams, treeValue: string) {
  const next = new URLSearchParams()

  // Preserve a minimal set of "map view" params so opening tree doesn't jump the map.
  PRESERVE_ON_OPEN.forEach((key) => {
    const value = current.get(key)
    if (value) next.set(key, value)
  })

  next.set('tree', treeValue)
  return next
}

export function useTreeIsolation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const treeSavedQuery = useSessionStore((s) => s.treeSavedQuery)
  const setTreeSavedQuery = useSessionStore((s) => s.setTreeSavedQuery)
  const clearTreeSavedQuery = useSessionStore((s) => s.clearTreeSavedQuery)

  const openTree = (treeValue: string) => {
    // Only store state when entering tree from the /search experience.
    if (pathname === '/search' && !searchParams.get('tree')) {
      setTreeSavedQuery(searchParams.toString())
    }

    const nextParams = buildTreeSearchParams(new URLSearchParams(searchParams), treeValue)
    const qs = nextParams.toString()

    if (pathname === '/search') {
      router.replace(qs ? `?${qs}` : '?tree=root')
    } else {
      router.push(qs ? `/search?${qs}` : '/search?tree=root')
    }
  }

  const closeTree = () => {
    // Prefer restoring the stored query string (full previous state).
    if (treeSavedQuery) {
      router.replace(treeSavedQuery ? `?${treeSavedQuery}` : '/search')
      clearTreeSavedQuery()
      return
    }

    // Fallback: just remove tree from current query.
    const next = new URLSearchParams(searchParams)
    next.delete('tree')
    const qs = next.toString()
    router.replace(qs ? `?${qs}` : '/search')
  }

  return { openTree, closeTree }
}


