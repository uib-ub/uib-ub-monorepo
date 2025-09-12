'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fieldConfig } from "@/config/search-config"
import { getBnr, getFieldValue } from '@/lib/utils'
import Clickable from '@/components/ui/clickable/clickable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CadastralTableProps {
  dataset: string
  uuid: string
  list: boolean
}

export default function CadastralTable({ dataset, uuid, list }: CadastralTableProps) {
  const { data: cadastralData, isLoading: cadastralLoading } = useQuery({
    queryKey: ['cadastral', dataset, uuid],
    queryFn: async () => {
      const params = new URLSearchParams({
        perspective: dataset,
        within: uuid,
        size: '1000',
        asc: 'cadastre__gnr,cadastre__bnr'
      })

      const res = await fetch(`/api/search/table?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch cadastral data')
      return res.json()
    },
    enabled: !!dataset && !!uuid
  })

  const PAGE_SIZE = 20
  const [limit, setLimit] = useState(PAGE_SIZE)

  const hits = cadastralData?.hits?.hits || []

  if (cadastralLoading || !hits.length) return null

  if (list) {
    return <ul className="list-none divide-y divide-neutral-200">
      {hits.map((hit: any) => (
        <li key={hit._id} className="py-2">
            <Clickable link add={{ doc: hit._source.uuid, details: 'group' }} className="no-underline block px-3 py-2 hover:bg-neutral-50">
                {`${getBnr(hit, dataset)} ${hit._source.label}`}
            </Clickable>
        </li>
      ))}
    </ul>
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
