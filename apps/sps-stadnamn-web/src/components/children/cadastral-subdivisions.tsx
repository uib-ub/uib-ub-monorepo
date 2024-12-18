
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



    const gnr =  getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")
    return (
    <div className="bg-white">
        {
            !childrenLoading && <>
            {isMobile || mode == 'table' ?
            <h2 className="px-2 pb-2">{gnr} {parentData?._source?.label}</h2>
            
            : <div className="flex bg-white cadastre-header rounded-t-md">
                <h2 className={`p-2 px-4 text-lg  !font-sans text`}>
                    <SearchLink aria-current={doc == parentData?._source?.uuid ? 'page' : false} 
                                      className="no-underline"
                                      add={{ doc: parent }}><span className={`font-bold ${doc == parentData?._source?.uuid ? 'text-accent-800' : 'text-primary-600'}`}>{gnr}</span>     {parentData?._source?.label}
                    </SearchLink>

                </h2>
                {mode != 'table' && 
                <div className="float-right text-2xl flex gap-2 p-1 items-center ml-auto">

                <IconButton label="Lukk" onClick={() => setParent(null)}><PiX aria-hidden="true"/></IconButton>
                </div>}
                </div>}
                <div className="overflow-x-auto border border-neutral-300 rounded-md mx-2 mb-2">
                        <table className="w-full result-table">
                            <thead className="w-full">
                                <tr>
                                    <th className="">Bruk</th>
                                    {fields.map((field: Record<string, any>) => (
                                        <th className="" key={field.key}>{field.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {childrenData.map((hit: any) => (
                                    <tr key={hit._id} >
                                        <th className="w-full h-full flex !p-0">
                                        <SearchLink aria-current={doc==hit.fields?.uuid[0] ? 'page' : false} 
                                                            className={`no-underline w-full p-1 px-2 h-full${doc == hit.fields?.uuid[0] ? 'border-l-4 bg-accent-800 text-white' : 'pl-4'} `}
                                                            add={{ doc: hit.fields?.uuid[0] }}>
                                        <span className={`font-bold ${doc == hit.fields?.uuid[0] ? 'text-white' : 'text-primary-600'}`}>{hit.fields[leaf] || hit.fields.cadastre?.[0]?.bnr.join(",")}</span> {hit.fields.label}
                                            
                                                                
                                                                
                                            </SearchLink>
                                        </th>
                                        {fields.map((field: Record<string, any>) => (
                                            <td className="p-2" key={field.key}>{hit.fields[field.key]} {field.key} {JSON.stringify(hit)}</td>
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
