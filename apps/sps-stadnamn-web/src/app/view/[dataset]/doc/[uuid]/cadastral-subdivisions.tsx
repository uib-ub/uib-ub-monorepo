
'use client'
import Pagination from "@/components/results/pagination"
import SearchParamsLink from "@/components/ui/search-params-link"
import { facetConfig } from "@/config/search-config"
import { contentSettings } from "@/config/server-config"
import Link from "next/link"
import { useEffect, useState } from "react"
import { PiMagnifyingGlass } from "react-icons/pi"


export default function CadastralSubdivisions({bnrField, sortFields, dataset, source}: { bnrField: string, sortFields: string[], dataset: string, source: any }) {

    const [hits, setHits] = useState<Record<string,any> | null>(null)
    const fields = facetConfig[dataset].filter((field: Record<string,any>) => field.table && field.key !== bnrField)
    const [page, setPage] = useState(1)


    useEffect(() => {
        const fields = facetConfig[dataset].filter((field: Record<string,any>) => field.table && field.key !== bnrField)
         
        fetch(`/api/cadastral-subdivisions?dataset=${dataset}&uuid=${source.uuid}&fields=${["uuid", "label", bnrField, ...fields.map((field: Record<string,any>) => field.key).join(",")]}&sortFields=${sortFields.join(",")}`)
            .then(response => response.json())
            .then(data => setHits(data.hits))
        
    }, [dataset, source.uuid, bnrField, sortFields])


    const gotoSearchUrl = () => {
        const newSearchParams = new URLSearchParams()
        newSearchParams.set('within', source.uuid)
        newSearchParams.set('display', contentSettings[dataset].display)

        return `/view/${dataset}?${newSearchParams.toString()}`

    }


    return hits && (
<div className="space-y-4">
            <table className="result-table max-h-[320px] overflow-y-auto">
                <caption className="sr-only">Underordna bruk</caption>
                <thead>
                    <tr>
                        <th>Namn</th>

                        {fields.map((field: Record<string,any>) => (
                            <th key={field.key}>{field.label}</th>
                        ))}
                    </tr>

                </thead>
                <tbody>
                    {hits.hits.slice((page - 1) * 10, page * 10).map((hit: any) => (

                        <tr key={hit._id}>
                            <td><SearchParamsLink href={`/view/${dataset}/doc/${hit.fields.uuid}`}>{hit.fields[bnrField]} {hit.fields.label}</SearchParamsLink></td>
                            {fields.map((field: Record<string,any>) => (
                                <td key={field.key}>{hit.fields[field.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex gap-4">{hits.total.value > 10 && <Pagination currentPage={page} setCurrentPage={setPage} totalPages={Math.ceil(hits.total.value / 10)} />}
            {hits.total.value > 1 && <Link href={gotoSearchUrl()} className="btn btn-outline no-underline btn-compact"><PiMagnifyingGlass className="text-xl mr-2" aria-hidden="true"/>Søk i brukene</Link>}
            </div>
            </div>
    ) 
    
}

