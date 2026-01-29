/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type GroupSummary = { id: string; label?: string }

export default function LegacyChildren({ source }: { source: Record<string, any> }) {
  const children = useMemo(() => {
    const raw = (source as any)?.children ?? (source as any)?.misc?.children
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string' && v.length > 0) : []
  }, [source])

  const [groups, setGroups] = useState<GroupSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (children.length === 0) {
        setGroups([])
        return
      }

      try {
        setError(null)
        const res = await fetch('/api/legacy/children-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ children }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'REQUEST_FAILED')

        if (!cancelled) setGroups(Array.isArray(data?.groups) ? data.groups : [])
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
  }, [children])

  if (children.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="text-sm">
        Oppslag frå stadnamnportalen.uib.no. 
      </div>
      <h2 className="text-lg">Nye oppslag:</h2>

      {error && <div className="text-sm text-red-700">Kunne ikkje hente grupper: {error}</div>}
      {groups === null && !error && <div className="text-sm text-neutral-700">Hentar…</div>}
      {groups?.length === 0 && <div className="text-sm text-neutral-700">Ingen grupper funne.</div>}

      {groups && groups.length > 0 && (
        <div>
          <ul className="!m-0 !p-0 !list-none space-y-1">
            {groups.map((g) => (
              <li key={g.id}>
                <Link className="no-underline" href={`/search?group=${encodeURIComponent(g.id)}&maxResults=1`}>
                  {g.label || g.id}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}