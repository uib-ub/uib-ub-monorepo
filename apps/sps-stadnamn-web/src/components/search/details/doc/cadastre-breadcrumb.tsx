'use client'
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { treeSettings } from "@/config/server-config"
import { useSearchParams } from "next/navigation"
import { PiCaretRight, PiHouseFill } from "react-icons/pi"
import { buildTreeParam, parseTreeParam } from "@/lib/tree-param"
import { useQuery } from "@tanstack/react-query"
import { getValueByPath } from "@/lib/utils"
import IconButton from "@/components/ui/icon-button"
import { useTreeIsolation } from "@/lib/tree-isolation"

export default function CadastreBreadcrumb() {
  const searchParams = useSearchParams()
  const { dataset, adm1, adm2, uuid } = parseTreeParam(searchParams.get('tree'))
  const { closeTree } = useTreeIsolation()

  if (!dataset) return null

  const { data: selectedDoc, isLoading: selectedDocLoading } = useQuery({
    queryKey: ['treeSelectedDoc', dataset, uuid],
    enabled: !!dataset && !!uuid,
    queryFn: async () => {
      const params = new URLSearchParams({ uuid: uuid as string, dataset: dataset as string })
      const res = await fetch(`/api/tree?${params.toString()}`)
      if (!res.ok) return null
      const data = await res.json()
      return data?.hits?.hits?.[0]?._source || null
    },
    staleTime: 1000 * 60 * 5,
  })

  const selectedNumber =
    dataset && uuid && treeSettings[dataset] && selectedDoc
      ? ((selectedDoc as any)?.__treeNumber || (getValueByPath(selectedDoc, treeSettings[dataset].subunit) || ''))
      : ''

  return <>
    <IconButton
      label="Lukk matrikkelvising"
      className="breadcrumb-link text-lg whitespace-nowrap flex items-center gap-1"
      onClick={closeTree}
    >
      <PiHouseFill aria-hidden="true" className="inline" />
    </IconButton>
    <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
    {(dataset) && <>
      <Clickable
        link
        className="breadcrumb-link text-lg whitespace-nowrap"
        remove={['dataset', 'adm1', 'adm2', 'doc']}
        add={{ tree: buildTreeParam({ dataset }) }}
      >
        {datasetTitles[dataset]}
      </Clickable>
      <PiCaretRight className="w-4 h-4 self-center-center flex-shrink-0" />
    </>}

    {adm1 && (
      <>
        <Clickable
          link
          className="breadcrumb-link text-lg whitespace-nowrap"
          remove={['dataset', 'adm1', 'adm2', 'doc']}
          add={{ tree: buildTreeParam({ dataset, adm1 }) }}
        >
          {adm1}

        </Clickable>
        <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
      </>
    )}

    {adm2 && (
      <>
        <Clickable
          link
          className="breadcrumb-link text-lg whitespace-nowrap"
          remove={['dataset', 'adm1', 'adm2', 'doc']}
          add={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}
        >
          {adm2}
        </Clickable>
        <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
      </>
    )}

    <span className="text-lg">
      {uuid
        ? `${selectedNumber ? `${selectedNumber} ` : ''}${selectedDoc?.label || (selectedDocLoading ? '…' : '')}`.trim()
        : (adm2 || adm1 || datasetTitles[dataset])}
    </span>
  </>
}

