'use client'
import Clickable from '@/components/ui/clickable/clickable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { getBnr, getFieldValue } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { stringToBase64Url } from '@/lib/param-utils'
import { PiCaretRightBold, PiMapPinFill } from "react-icons/pi"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSessionStore } from '@/state/zustand/session-store'

interface CadastralTableProps {
  dataset: string
  uuid: string
  list: boolean
  groupId?: string // Parent gard's group.id for "Vel som hovudoppslag" button
  gnr?: string | number | null // Garden number for fallback query
  adm1?: string | null
  adm2?: string | null
  flush?: boolean // Remove outer padding/border wrappers (used on /uuid page)
  showGroupLink?: boolean // Show "Opne namnegruppe" row (default: true)
  showMarkers?: boolean // Show marker buttons/column (default: true)
}

export default function CadastralTable({ dataset, uuid, list, groupId: parentGroupId, gnr, adm1, adm2, flush, showGroupLink = true, showMarkers = true }: CadastralTableProps) {
  const searchParams = useSearchParams()
  const currentGroup = searchParams.get('group')
  const activePointParam = searchParams.get('activePoint')
  const clearTreeSavedQuery = useSessionStore((s) => s.clearTreeSavedQuery)
  
  const { data: cadastralData, isLoading: cadastralLoading, error: cadastralError } = useQuery({
    queryKey: ['cadastral', dataset, uuid, gnr, adm1, adm2],
    queryFn: async () => {
      const sortFields = treeSettings[dataset]?.sort?.length
        ? treeSettings[dataset].sort.join(',')
        : 'cadastre__gnr,cadastre__bnr'

      // First try with 'within' field
      const params = new URLSearchParams({
        perspective: dataset,
        within: uuid,
        includeSuppressed: '1',
        size: '1000',
        asc: sortFields
      })

      const res = await fetch(`/api/search/table?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch cadastral data')
      const data = await res.json()
      
      // If no results and we have gnr/adm info, try fallback query by cadastre number
      if ((!data?.hits?.hits?.length) && gnr && adm1 && adm2) {
        const fallbackParams = new URLSearchParams({
          perspective: dataset,
          'cadastre__gnr': String(gnr),
          'adm1': adm1,
          'adm2': adm2,
          'within': '_true', // Only items that have 'within' field (i.e., bruk, not farms)
          includeSuppressed: '1',
          size: '1000',
          asc: sortFields
        })
        
        const fallbackRes = await fetch(`/api/search/table?${fallbackParams.toString()}`)
        if (!fallbackRes.ok) throw new Error('Failed to fetch cadastral data')
        return fallbackRes.json()
      }
      
      return data
    },
    enabled: !!dataset && !!uuid
  })

  const PAGE_SIZE = 20
  const [limit, setLimit] = useState(PAGE_SIZE)

  const hits = cadastralData?.hits?.hits || []

  if (cadastralLoading) return null
  if (cadastralError) {
    return (
      <div className="text-sm text-neutral-800 px-3 py-2">
        Kunne ikkje henta underordna bruk.
      </div>
    )
  }
  if (!hits.length) {
    return (
      <div className="text-sm text-neutral-800 px-3 py-2">
        Ingen underordna bruk.
      </div>
    )
  }

  if (list) {
    const isParentSuppressed = !parentGroupId || parentGroupId === 'suppressed' || parentGroupId === 'noname'
    const cadastreTableFields = Object.entries(fieldConfig[dataset] || {})
      .filter(([_, cfg]) => cfg.cadastreTable)
      .map(([key, cfg]) => ({ key, label: cfg.label || key }))
    const outerGapClass = flush ? "gap-1" : "gap-2"
    const padXClass = flush ? "" : "px-3"
    const tableContainerClass = flush
      ? "bg-white"
      : "border border-neutral-200 rounded-md overflow-hidden bg-white"
    const headBgClass = flush ? "" : "bg-neutral-50"
    const headPadY = flush ? "py-1.5" : "py-2"
    const cellPadY = flush ? "py-1" : "py-1.5"
    const iconColWidth = flush ? "w-9" : "w-10"
    const groupLinkPadXClass = flush ? "px-3" : padXClass
    
    return (
      <div className={`flex flex-col ${outerGapClass}`}>
        {showGroupLink && !isParentSuppressed && (
          <div className={`${groupLinkPadXClass} py-1`}>
            <Clickable
              link
              onClick={() => clearTreeSavedQuery()}
              add={{ init: stringToBase64Url(parentGroupId) }}
              remove={['tree', 'doc', 'activePoint']}
              className="inline-flex items-center gap-1 text-sm text-neutral-700 hover:text-neutral-900 no-underline"
            >
              Opne namnegruppe <PiCaretRightBold aria-hidden="true" />
            </Clickable>
          </div>
        )}
        <div className={padXClass}>
          <TooltipProvider>
            <div className={tableContainerClass}>
              <table className={`w-full border-collapse ${flush ? "" : "table-fixed"} text-sm`}>
                <thead className={headBgClass}>
                  <tr>
                    {showMarkers && (
                      <th className={`${iconColWidth} px-2 ${headPadY} text-left font-semibold text-neutral-800`}></th>
                    )}
                    <th className={`px-2 ${headPadY} text-left font-semibold text-neutral-800`}>Bruk</th>
                    {cadastreTableFields.map((field) => (
                      <th key={field.key} className={`px-2 ${headPadY} text-left font-semibold text-neutral-800`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block cursor-help">{field.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>{field.label}</TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hits.map((hit: any) => {
                    const brukUuid = hit._source?.uuid
                    const bnrText = getBnr(hit, dataset)
                    const coords = hit._source?.location?.coordinates
                    const activePoint =
                      Array.isArray(coords) && coords.length === 2
                        ? `${coords[1]},${coords[0]}`
                        : undefined
                    const isActiveMarker = !!activePoint && !!activePointParam && activePointParam === activePoint

                    return (
                      <tr key={hit._id} className="border-t border-neutral-100">
                        {showMarkers && (
                          <td className={`px-2 ${cellPadY} align-middle`}>
                            {activePoint ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Clickable
                                    link
                                    add={{ activePoint }}
                                    aria-pressed={isActiveMarker}
                                    className={`inline-flex items-center justify-center ${flush ? "w-7 h-7" : "w-8 h-8"} rounded transition-colors ${isActiveMarker
                                      ? "text-accent-800 bg-accent-50 outline outline-1 outline-accent-700 hover:bg-accent-100"
                                      : "text-neutral-700 hover:bg-neutral-100"
                                      }`}
                                    aria-label="Vis punkt på kart"
                                  >
                                    <PiMapPinFill className="text-lg" aria-hidden="true" />
                                  </Clickable>
                                </TooltipTrigger>
                                <TooltipContent>Vis punkt på kart</TooltipContent>
                              </Tooltip>
                            ) : null}
                          </td>
                        )}
                        <td className={`px-2 ${cellPadY} align-middle truncate`}>
                          {brukUuid ? (
                            <Link
                              href={`/uuid/${brukUuid}`}
                              className="text-neutral-900 hover:text-neutral-700 decoration-1 underline-offset-2 hover:underline"
                            >
                              <span className="tabular-nums font-medium">{bnrText ? `${bnrText} ` : ''}</span>
                              {hit._source?.label}
                            </Link>
                          ) : (
                            <span className="text-neutral-900">
                              <span className="tabular-nums font-medium">{bnrText ? `${bnrText} ` : ''}</span>
                              {hit._source?.label}
                            </span>
                          )}
                        </td>
                        {cadastreTableFields.map((field) => {
                          const value = getFieldValue(hit, field.key)
                          const displayValue = Array.isArray(value) ? value.join(', ') : (value || '')
                          return (
                            <td key={field.key} className={`px-2 ${cellPadY} align-middle text-neutral-800 truncate`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="block truncate cursor-help">{displayValue}</span>
                                </TooltipTrigger>
                                <TooltipContent>{displayValue || 'Ingen verdi'}</TooltipContent>
                              </Tooltip>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  const cadastreTableFields = Object.entries(fieldConfig[dataset] || {})
    .filter(([_, cfg]) => cfg.cadastreTable)
    .map(([key, cfg]) => ({ key, label: cfg.label }))

  // If no cadastreTable fields, use some common cadastral fields as fallback
  const fallbackFields = [
    { key: 'misc.MNR', label: 'Matrikkelnummer' },
    { key: 'misc.LNR', label: 'Løpenummer' },
    { key: 'misc.knr', label: 'Kommunenummer' },
    { key: 'cadastre.gnr', label: 'Gardsnummer' },
    { key: 'cadastre.bnr', label: 'Bruksnummer' }
  ].filter(field => {
    // Only include fields that exist in the fieldConfig for this dataset
    return fieldConfig[dataset]?.[field.key]
  })

  const fields = cadastreTableFields.length > 0 ? cadastreTableFields : fallbackFields

  const visible = hits.slice(0, limit)
  const hasMore = hits.length > limit

  return (
    <TooltipProvider>
      <div className="border-t border-b border-neutral-200 text-sm">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="text-left py-2 font-semibold text-neutral-800">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate block cursor-help">Bruk</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Bruk
                  </TooltipContent>
                </Tooltip>
              </th>
              {fields.map((field) => (
                <th className="text-left py-2 font-semibold text-neutral-800" key={field.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate block cursor-help">{field.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {field.label}
                    </TooltipContent>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((hit: any, index: number) => {
              const brukText = `${getBnr(hit, dataset)} ${getFieldValue(hit, 'label')?.[0] || ''}`.trim()

              return (
                <tr key={index} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-1 truncate">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate">
                          <Clickable link add={{ doc: getFieldValue(hit, 'uuid')?.[0] }} className="text-neutral-900 hover:text-neutral-700 decoration-1 underline-offset-2 hover:underline">
                            {brukText}
                          </Clickable>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {brukText}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {fields.map((field, idx) => {
                    const value = getFieldValue(hit, field.key)
                    const displayValue = Array.isArray(value) ? value.join(', ') : value || ''

                    return (
                      <td className="py-1 text-neutral-800 truncate" key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{displayValue}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {displayValue || 'Ingen verdi'}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        {hasMore && (
          <div className="py-1 px-1 border-t border-neutral-200 bg-neutral-50">
            <button
              type="button"
              onClick={() => setLimit(limit + PAGE_SIZE)}
              className="text-neutral-700 hover:text-neutral-600 decoration-1 underline-offset-2 hover:underline text-xs"
            >
              Vis fleire ({hits.length - limit} til)
            </button>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
