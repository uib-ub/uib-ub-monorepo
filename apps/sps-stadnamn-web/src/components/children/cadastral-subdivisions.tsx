
'use client'
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useQueryState } from "nuqs"
import { useContext, useState } from "react"
import { PiX } from "react-icons/pi"
import SearchLink from "../ui/search-link"
import IconButton from "../ui/icon-button"
import { getValueByPath } from "@/lib/utils"
import { ChildrenContext } from "@/app/children-provider"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"


export default function CadastralSubdivisions({isMobile}: { isMobile: boolean }) {
    const dataset = useDataset()
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const [parent, setParent] = useQueryState('parent', {history: 'push'})


    const { subunit, leaf  } = treeSettings[dataset]

    
    const { parentData } = useContext(DocContext)
    const { childrenData, childrenLoading } = useContext(ChildrenContext)



    const title =  <>{getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")} {parentData?._source?.label}</>
    return (
    <div className="bg-white">
        {
            !childrenLoading && <>
            {isMobile || mode == 'table' ?
            <h2 className="px-2 pb-2">{title}</h2>
            
            : <div className="flex bg-neutral-50 cadastre-header rounded-t-md">
                <h2 className="p-2 px-4 text-lg  font-semibold !font-sans text">
                    <SearchLink aria-current={doc == parentData?._source?.uuid ? 'page' : false} 
                                      className="aria-[current=page]:decoration-accent-700"
                                      add={{ doc: parent }}>{title}
                    </SearchLink>

                </h2>
                {mode != 'table' && 
                <div className="float-right text-2xl flex gap-2 p-1 items-center ml-auto">

                <IconButton label="Lukk" onClick={() => setParent(null)}><PiX aria-hidden="true"/></IconButton>
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
                                {childrenData.map((hit: any) => (
                                    <tr key={hit._id} >
                                        <td className="border p-2 border-x-0">
                                        <SearchLink aria-current={doc==hit.fields?.uuid ? 'page' : false} 
                                                              className="aria-[current=page]:decoration-accent-700 whitespace-nowrap lg:whitespace-normal"
                                                              add={{ doc: hit.fields?.uuid }}>
                                        {hit.fields[leaf] || hit.fields.cadastre?.[0]?.bnr.join(",")} {hit.fields.label}
                                            
                                                                
                                                                
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
          
               
            </>
        }
    </div>
);
}
