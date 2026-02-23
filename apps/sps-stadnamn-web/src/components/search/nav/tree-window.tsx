'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { treeSettings } from "@/config/server-config";
import { buildTreeParam, parseTreeParam } from "@/lib/tree-param";
import { getValueByPath } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PiHouseFill, PiX } from "react-icons/pi";
import DatasetFacet from "./facets/dataset-facet";
import TreeList from "./tree-list";
import Clickable from "@/components/ui/clickable/clickable";

export default function TreeWindow() {
    const searchParams = useSearchParams()
    const { dataset, adm1, adm2, uuid } = parseTreeParam(searchParams.get('tree'))

    const { data: selectedDoc, isLoading: selectedDocLoading, isError: selectedDocError } = useQuery({
        queryKey: ['treeSelectedDoc', dataset, uuid],
        enabled: !!dataset && !!uuid,
        queryFn: async () => {
            const params = new URLSearchParams({ uuid: uuid as string, dataset: dataset as string })
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
            ? ((selectedDoc as any)?.__treeNumber || (getValueByPath(selectedDoc, treeSettings[dataset].subunit) || ''))
            : ''

    // Title: when a cadastral unit is selected, show its label (not uuid).
    const title =
        uuid
            ? (selectedDoc?.label || (selectedDocLoading ? 'Laster…' : ''))
            : (adm2 ? adm2 : adm1 ? adm1 : dataset ? datasetTitles[dataset || ''] : 'Matriklar')

    return (<>
        <div className="flex p-2 border-b border-neutral-200 shrink-0">
            <div id="right-title" className="text-black text-xl mr-auto mx-1">
                {title}
            </div>
            {

            }
        </div>
        <div className="flex-1 overflow-y-auto stable-scrollbar min-h-0">
            {/* Breadcrumbs driven by `tree` */}
            {dataset && (
                <div className="sticky top-0 z-10 bg-white px-3 pt-2 pb-1 text-sm flex flex-wrap gap-2 border-b border-neutral-200">
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

            {/* State machine driven by `tree` */}
            {!dataset && <DatasetFacet />}
            {dataset && !treeSettings[dataset] && (
                <div className="p-3 text-neutral-900">Datasettet har ikkje matrikkelvising.</div>
            )}
            {dataset && treeSettings[dataset] && (
                <TreeList dataset={dataset} adm1={adm1} adm2={adm2} expandedUuid={uuid} docUuid={searchParams.get('doc')} />
            )}
        </div>
    </>)
}