
'use client'
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useQueryState } from "nuqs"
import { useContext, useState } from "react"
import { PiInfo, PiInfoFill, PiX } from "react-icons/pi"
import ParamLink from "../ui/param-link"
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
    <div className="">
        {
            !childrenLoading && <>
            {isMobile || mode == 'table' ?
            <h2 className="px-2 pb-2">{gnr} {parentData?._source?.label}</h2>
            
            : <div className="flex rounded-t-md">
                <h2 className={`p-2 px-2 text-lg  !font-sans text`}>
                    <ParamLink aria-current={doc == parentData?._source?.uuid ? 'page' : false} 
                                      className="no-underline flex items-center gap-1"
                                      add={{ doc: parent }}>{gnr} {parentData?._source?.label} { doc == parentData?._source?.uuid ? <PiInfoFill className="text-accent-800" aria-hidden="true"/> : <PiInfo className="text-primary-600" aria-hidden="true"/>}
                    </ParamLink>

                </h2>
                {mode == 'map' && 
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
                                    <tr key={hit._id}>
                                        <th className="!w-full !h-full !p-0">
                                        <ParamLink aria-current={doc==hit.fields?.uuid[0] ? 'page' : false} 
                                                            className={`no-underline !flex !w-full p-2 !h-full grow ${doc == hit.fields?.uuid[0] ? 'border-l-4 bg-accent-800' : 'pl-4'} `}
                                                            add={{ doc: hit.fields?.uuid[0] }}>
                                        <span className={`${doc == hit.fields?.uuid[0] ? 'text-white' : 'text-black'}`}>{hit.fields?.[leaf] || hit.fields?.cadastre?.[0]?.bnr.join(",")} {hit.fields?.label}</span>
                                            
                                                                
                                                                
                                            </ParamLink>
                                        </th>
                                        {fields.map((field: Record<string, any>) => (
                                            <td className="p-2" key={field.key}>{hit.fields[field.key]}</td>
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
