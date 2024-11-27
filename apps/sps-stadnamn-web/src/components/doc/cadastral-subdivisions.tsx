
'use client'
import Pagination from "@/components/results/pagination"
import SearchParamsLink from "@/components/ui/search-params-link"
import { facetConfig, fieldConfig } from "@/config/search-config"
import { contentSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import Link from "next/link"
import { createSerializer, parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { PiInfoFill, PiMagnifyingGlass, PiTree, PiTreeView, PiX } from "react-icons/pi"
import SearchLink from "../ui/search-link"
import IconButton from "../ui/icon-button"


export default function CadastralSubdivisions({gnrField, bnrField, sortFields}: { gnrField: string, bnrField: string, sortFields: string}) {
    const dataset = useDataset()
    const [hits, setHits] = useState<Record<string,any> | null>(null)
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const [page, setPage] = useState(1)
    const [cadastralUnit, setCadastralUnit] = useQueryState('cadastralUnit')
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'search'})
    const [selectedCadastralUnit, setSelectedCadastralUnit] = useState<any | null>(null)



    useEffect(() => {
        if (cadastralUnit) {
            setSelectedCadastralUnit(null)
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
        setHits(null)
        fetch(`/api/cadastral-subdivisions?dataset=${dataset}&uuid=${cadastralUnit}&fields=${["uuid", "label", bnrField, ...fields.map((field: Record<string,any>) => field.key)]}&sortFields=${sortFields}`)
            .then(response => response.json())
            .then(data => {
                
                setHits(data.hits)
            }
            ).catch(error => {
                console.error(error)

            }
            )
        
    }, [dataset, cadastralUnit, gnrField, bnrField, sortFields])


    return (
    <>
        {
            hits && cadastralUnit && cadastralUnit == selectedCadastralUnit?._source?.uuid && <>
            <div className="flex bg-neutral-50">
                <h2 className="p-2 px-4 text-lg  font-semibold !font-sans text">
                    <SearchParamsLink addParams={{ expanded: 'info', doc: cadastralUnit }}>{selectedCadastralUnit?._source?.cadastre?.[0]?.gnr} {selectedCadastralUnit?._source?.label}</SearchParamsLink>
                </h2>
                <div className="float-right text-2xl flex gap-2 p-1 items-center ml-auto">
                <SearchLink label="Bla i registeret" 
                            dataset={dataset} 
                            params={{cadastralUnit, 
                                     doc, 
                                     mode: 'tree',
                                     adm: selectedCadastralUnit?._source.adm2 + "__" + selectedCadastralUnit?._source.adm1}}><PiTreeView aria-hidden="true"/></SearchLink>
                <IconButton label="Søk i brukene" onClick={() => setMode('tree')}><PiMagnifyingGlass aria-hidden="true"/></IconButton>
                <IconButton label="Lukk" onClick={() => setCadastralUnit(null)}><PiX aria-hidden="true"/></IconButton>
                </div>
                </div>
                        <table className="w-full result-table border-x-0">
                            <thead className="w-full">
                                <tr>
                                    <th className="">Namn</th>
                                    {fields.map((field: Record<string, any>) => (
                                        <th className="bg-white" key={field.key}>{field.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {hits.hits.slice((page - 1) * 300, page * 300).map((hit: any) => (
                                    <tr key={hit._id} >
                                        <td className="border p-2 border-x-0">
                                        <SearchParamsLink aria-current={doc==hit.fields.uuid ? 'page' : false} 
                                                              className="aria-[current=page]:decoration-accent-700"
                                                              addParams={{ doc: hit.fields.uuid, expanded: 'info' }}>
                                        {hit.fields[bnrField]} {hit.fields.label}
                                            
                                                                
                                                                
                                            </SearchParamsLink>
                                        </td>
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
