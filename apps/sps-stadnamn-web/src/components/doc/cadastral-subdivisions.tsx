
'use client'
import Pagination from "@/components/results/pagination"
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { PiMagnifyingGlass, PiTreeView, PiX } from "react-icons/pi"
import SearchLink from "../ui/search-link"
import IconButton from "../ui/icon-button"
import { getValueByPath } from "@/lib/utils"


export default function CadastralSubdivisions({isMobile}: { isMobile: boolean }) {
    const dataset = useDataset()
    const [hits, setHits] = useState<Record<string,any> | null>(null)
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const [page, setPage] = useState(1)
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const [within, setWithin] = useQueryState('within', {history: 'push'})
    const [selectedWithin, setSelectedWithin] = useState<any | null>(null)

    const { subunit, leaf  } = treeSettings[dataset]



    useEffect(() => {
        if (within) {
            setSelectedWithin(null)
            fetch(`/api/doc?uuid=${within}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
                if (data.hits?.hits?.length) {
                    setSelectedWithin(data.hits.hits[0])
                }
                
            })
        }
        else {
            setSelectedWithin(null)
        }
    }   
    , [within, dataset, setSelectedWithin])
    



    useEffect(() => {
        setHits(null)
        fetch(`/api/cadastral-subdivisions?dataset=${dataset}&uuid=${within}`)
            .then(response => response.json())
            .then(data => {
                
                setHits(data.hits)
            }
            ).catch(error => {
                console.error(error)

            }
            )
        
    }, [dataset, within])

    const title =  selectedWithin?._source && <>{getValueByPath(selectedWithin._source, treeSettings[dataset]?.subunit) || selectedWithin?._source?.cadastre?.[0]?.gnr.join(",")} {selectedWithin?._source?.label}</>

    return (
    <div className="bg-white">
        {
            hits && within && within == selectedWithin?._source?.uuid && <>
            {isMobile || mode == 'table' ?
            <h2 className="px-2 pb-2">{title}</h2>
            
            : <div className="flex bg-neutral-50 cadastre-header rounded-t-md">
                <h2 className="p-2 px-4 text-lg  font-semibold !font-sans text">
                    <SearchLink aria-current={doc == selectedWithin?._source?.uuid ? 'page' : false} 
                                      className="aria-[current=page]:decoration-accent-700"
                                      add={{ doc: within }}>{title}
                    </SearchLink>

                </h2>
                {mode != 'table' && 
                <div className="float-right text-2xl flex gap-2 p-1 items-center ml-auto">

                <IconButton label="Lukk" onClick={() => setWithin(null)}><PiX aria-hidden="true"/></IconButton>
                </div>}
                </div>}
                <div className="overflow-x-auto">
                        <table className="w-full result-table border-x-0">
                            <thead className="w-full">
                                <tr>
                                    <th>Namn</th>
                                    {fields.map((field: Record<string, any>) => (
                                        <th className="bg-white" key={field.key}>{field.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {hits.hits.slice((page - 1) * 300, page * 300).map((hit: any) => (
                                    <tr key={hit._id} >
                                        <td className="border p-2 border-x-0">
                                        <SearchLink aria-current={doc==hit.fields?.uuid ? 'page' : false} 
                                                              className="aria-[current=page]:decoration-accent-700 whitespace-nowrap lg:whitespace-normal"
                                                              add={{ doc: hit.fields?.uuid }}>
                                        {hit.fields[leaf]} {hit.fields.label}
                                            
                                                                
                                                                
                                            </SearchLink>
                                        </td>
                                        {fields.map((field: Record<string, any>) => (
                                            <td className="border p-2" key={field.key}>{hit.fields[field.key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
          
               
                {hits.total.value > 300 && <Pagination currentPage={page} setCurrentPage={setPage} totalPages={Math.ceil(hits.total.value / 300)} />}
            </>
        }
    </div>
);
}
