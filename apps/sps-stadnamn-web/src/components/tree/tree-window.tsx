'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { treeSettings } from "@/config/server-config";
import { buildTreeParam, parseTreeParam } from "@/lib/tree-param";
import { getValueByPath } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PiCaretLeftBold, PiHouseFill, PiX } from "react-icons/pi";
import DatasetFacet from "@/components/facets/dataset-facet";
import TreeList from "./tree-list";
import Clickable from "@/components/ui/clickable/clickable";
import { useSessionStore } from "@/state/zustand/session-store";
import { useDocParam, useTreeParam } from "@/lib/param-hooks";

export default function TreeWindow() {
    const treeSavedQuery = useSessionStore((s) => s.treeSavedQuery)
    const tree = useTreeParam()
    const { dataset, adm1, adm2, uuid } = parseTreeParam(tree)
    const doc = useDocParam()

    const { data: selectedDoc, isLoading: selectedDocLoading, isError: selectedDocError } = useQuery({
        queryKey: ['treeSelectedDoc', dataset, uuid],
        enabled: !!dataset && !!uuid,
        queryFn: async () => {
            const params = new URLSearchParams({ uuid: uuid as string, dataset: dataset as string, includeSuppressed: 'on' })
            const res = await fetch(`/api/tree?${params.toString()}`)
            if (!res.ok) return null
            const data = await res.json()
            return data?.hits?.hits?.[0]?._source || null
        },
        // We often prefill this cache from the list click; keep it fresh for a while.
        staleTime: 1000 * 60 * 5,
    })

    const selectedNumber =
        dataset && uuid && treeSettings[dataset] && selectedDoc
            ? ((selectedDoc as any)?.__treeNumber || selectedDoc?.gnr || (getValueByPath(selectedDoc, treeSettings[dataset].subunit) || ''))
            : ''


    return (<>
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-300">
                <div className="flex p-2 border-b border-neutral-200 shrink-0 items-center gap-2">
                    <div id="right-title" className="text-black text-xl mx-1 font-semibold">
                        Hierarkisk vising
                    </div>
                    {treeSavedQuery && <div className="ml-auto flex items-center">
                        <Clickable
                            className="flex items-center gap-2 text-sm text-neutral-900 no-underline"
                            link
                            href={`/search?${treeSavedQuery}`}
                        >
                            <PiCaretLeftBold aria-hidden="true" className="text-primary-700" />
                            Stadnamnsøk
                        </Clickable>
                    </div>}
                </div>
                {/* Breadcrumbs driven by `tree` */}
                {dataset && (
                    <div className="bg-white px-3 pt-2 pb-1 text-sm flex flex-wrap gap-2 border-b border-neutral-200">
                        <ClickableIcon
                            link
                            label="Matriklar"
                            className="breadcrumb-link"
                            remove={['doc', 'activePoint']}
                            add={{ tree: 'root' }}
                        >
                            <PiHouseFill aria-hidden="true" className="inline" />
                        </ClickableIcon>
                        {dataset && (
                            <>
                                <span>/</span>
                                <Clickable
                                    link
                                    className="breadcrumb-link"
                                    add={{ tree: buildTreeParam({ dataset }) }}
                                >
                                    {datasetTitles[dataset] || dataset}
                                </Clickable>
                            </>
                        )}
                        {dataset && adm1 && (
                            <>
                                <span>/</span>
                                <Clickable
                                    link
                                    className="breadcrumb-link"
                                    remove={['doc', 'activePoint']}
                                    add={{ tree: buildTreeParam({ dataset, adm1 }) }}
                                >
                                    {adm1}
                                </Clickable>
                            </>
                        )}
                        {dataset && adm1 && adm2 && (
                            <>
                                <span>/</span>
                                <Clickable
                                    link
                                    className="breadcrumb-link"
                                    remove={['doc', 'activePoint']}
                                    add={{ tree: buildTreeParam({ dataset, adm1, adm2 }) }}
                                >
                                    {adm2}
                                </Clickable>
                            </>
                        )}
                        {dataset && adm1 && adm2 && uuid && (
                            <>
                                <span>/</span>
                                <span className="text-neutral-900">
                                    {`${selectedNumber ? `${selectedNumber} ` : ''}${selectedDoc?.label || (selectedDocLoading ? '…' : '')}`.trim()}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0">
                {/* State machine driven by `tree` */}
                {!dataset && <DatasetFacet />}
                {dataset && !treeSettings[dataset] && (
                    <div className="p-3 text-neutral-900">Datasettet har ikkje matrikkelvising.</div>
                )}
                {dataset && treeSettings[dataset] && (
                    <TreeList dataset={dataset} adm1={adm1} adm2={adm2} expandedUuid={uuid} docUuid={doc} />
                )}
            </div>
        </div>
    </>)
}