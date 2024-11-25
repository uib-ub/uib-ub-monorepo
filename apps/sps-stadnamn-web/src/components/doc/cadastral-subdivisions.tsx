
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
    const [selectedCadastralUnit, setSelectedCadastralUnit] = useState<any | null>(null)

    const serialize = createSerializer({
        within: parseAsString,
        dataset: parseAsString,
    })


    useEffect(() => {
        if (cadastralUnit) {
            setIsLoading(true)
            fetch(`/api/doc?uuid=${cadastralUnit}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setSelectedCadastralUnit(data.hits.hits[0])
                }
            })
        }
        else {
            setSelectedCadastralUnit(null)
        }
    }   
    , [cadastralUnit, dataset, setSelectedCadastralUnit])
    



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
    <>
        {isLoading ? 
        <div className="result-table max-h-[320px]">
            <div className="animate-pulse bg-neutral-50 h-12 border-b border-neutral-200"></div>
            <div className="h-8 border-b border-neutral-200"></div>
            <div className="animate-pulse bg-neutral-50 h-8 border-b border-neutral-200"></div>
        </div> :
            hits && cadastralUnit && <>
                <h2 className="p-2 px-4 text-lg text-white bg-neutral-800 font-semibold !font-sans text">
                    <SearchParamsLink className="no-underline hover:underline decoration-white" addParams={{ expanded: 'info', doc: cadastralUnit }}>{selectedCadastralUnit?._source?.cadastre?.[0]?.gnr} {selectedCadastralUnit?._source?.label}</SearchParamsLink>
                </h2>
                        <table className="w-full result-table border-x-0">
                            <thead className="w-full">
                                <tr className="">
                                    <th className="">Namn</th>
                                    {fields.map((field: Record<string, any>) => (
                                        <th className="bg-white" key={field.key}>{field.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {hits.hits.slice((page - 1) * 300, page * 300).map((hit: any) => (
                                    <tr key={hit._id}>
                                        <td className="border p-2 border-x-0"><SearchParamsLink aria-current={doc==hit.fields.uuid ? 'page' : false} addParams={{ doc: hit.fields.uuid, expanded: 'info' }}>{hit.fields[bnrField]} {hit.fields.label}</SearchParamsLink></td>
                                        {fields.map((field: Record<string, any>) => (
                                            <td className="border p-2" key={field.key}>{hit.fields[field.key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
          
               
                {hits.total.value > 300 && <Pagination currentPage={page} setCurrentPage={setPage} totalPages={Math.ceil(hits.total.value / 300)} />}
            </>
        }
    </>
);
}
