
'use client'
import Pagination from "@/components/results/pagination"
import SearchParamsLink from "@/components/ui/search-params-link"
import { facetConfig, fieldConfig } from "@/config/search-config"
import { contentSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import Link from "next/link"
import { createSerializer, parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { PiInfoFill, PiMagnifyingGlass } from "react-icons/pi"
import SearchLink from "../ui/search-link"
import IconButton from "../ui/icon-button"


export default function CadastralSubdivisions({gnrField, bnrField, sortFields}: { gnrField: string, bnrField: string, sortFields: string[]}) {
    const dataset = useDataset()
    const [hits, setHits] = useState<Record<string,any> | null>(null)
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const cadastralUnit = useQueryState('cadastralUnit')[0]
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const [expanded, setExpanded] = useQueryState('expanded', { history: 'push'})

    const serialize = createSerializer({
        within: parseAsString,
        dataset: parseAsString,
    })
    



    useEffect(() => {
        const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
            return { key, label: value.label }
        })
        
        fetch(`/api/cadastral-subdivisions?dataset=${dataset}&uuid=${cadastralUnit}&fields=${["uuid", "label", bnrField, ...fields.map((field: Record<string,any>) => field.key)]}&sortFields=${sortFields.join(",")}`)
            .then(response => response.json())
            .then(data => {
                
                setHits(data.hits)
                setIsLoading(false)
            }
            ).catch(error => {
                console.error(error)
                setIsLoading(false)
            }
            )
        
    }, [dataset, cadastralUnit, gnrField, bnrField, sortFields])







    return (
        <div className="space-y-4 w-full overflow-auto">
            {isLoading ? 
            <div className="result-table max-h-[320px]">
                <div className="animate-pulse bg-neutral-50 h-12 border-b border-neutral-200"></div>
                <div className="h-8 border-b border-neutral-200"></div>
                <div className="animate-pulse bg-neutral-50 h-8 border-b border-neutral-200"></div>
            </div> :
                hits && <>
                    <div className="flex gap-4"><h2 className="!text-xl">2 Berg <IconButton label="Info" onClick={()=> { setDoc(cadastralUnit); setExpanded('info') }}><PiInfoFill className="text-primary-600"/></IconButton></h2>
                    {hits.total.value > 1 && false && <Link href={serialize({dataset, within: cadastralUnit})} className="btn btn-outline no-underline btn-compact"><PiMagnifyingGlass className="text-xl mr-2" aria-hidden="true"/>Søk i brukene</Link>}
                    </div>
                    <div className="result-table !mt-1">
                        <div className="w-full">
                            <table className="w-full">
                            <caption className="sr-only">Underordna bruk</caption>
                                <thead className="w-full">
                                    <tr>
                                        <th>Namn</th>
                                        {fields.map((field: Record<string, any>) => (
                                            <th className="sticky top-0 bg-white" key={field.key}>{field.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="w-full max-h-[30svh] overflow-y-auto">
                            <table className="w-full">
                                <tbody className="block">
                                    {hits.hits.slice((page - 1) * 300, page * 300).map((hit: any) => (
                                        <tr key={hit._id} className="table w-full table-fixed">
                                            <td className="border p-2"><SearchParamsLink addParams={{ doc: hit.fields.uuid, expanded: 'info' }}>{hit.fields[bnrField]} {hit.fields.label}</SearchParamsLink></td>
                                            {fields.map((field: Record<string, any>) => (
                                                <td className="border p-2" key={field.key}>{hit.fields[field.key]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {hits.total.value > 300 && <Pagination currentPage={page} setCurrentPage={setPage} totalPages={Math.ceil(hits.total.value / 300)} />}
            

                </>
            }
        </div>
    );
}
