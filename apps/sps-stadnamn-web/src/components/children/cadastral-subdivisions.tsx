'use client'
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useQueryState } from "nuqs"
import { useContext, useState } from "react"
import { PiInfo, PiInfoFill, PiX } from "react-icons/pi"
import Clickable from "../ui/clickable/clickable"
import { getValueByPath } from "@/lib/utils"
import { ChildrenContext } from "@/app/children-provider"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"
import { GlobalContext } from "@/app/global-provider"


export default function CadastralSubdivisions() {
    const dataset = useDataset()
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const [parent, setParent] = useQueryState('parent', {history: 'push'})


    const { subunit, leaf  } = treeSettings[dataset]

    
    const { parentData, docView, parentLoading } = useContext(DocContext)
    const { isMobile } = useContext(GlobalContext)
    const { childrenData, childrenLoading } = useContext(ChildrenContext)




    const gnr =  getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")
    return (
    <>
            {(isMobile || mode == 'table') ?
            <h2 className="pb-2">{gnr} {parentData?._source?.label}</h2>
            
            : <div className="flex rounded-t-md">
                <h2 className={`py-2 pr-8 text-lg  !font-sans text`}>
                    <Clickable link aria-current={doc == parentData?._source?.uuid ? 'page' : false} 
                                      className="no-underline flex items-center gap-2"
                                      add={{ doc: parent }}>
                                        { doc == parentData?._source?.uuid ? <PiInfoFill className="text-accent-800" aria-hidden="true"/> : <PiInfo className="text-primary-600" aria-hidden="true"/>}
                                        {gnr} {parentData?._source?.label} 
                    </Clickable>

                </h2>
                {mode == 'map' && 
                <div className="float-right text-2xl flex gap-2 p-1 items-center ml-auto">
                    <Clickable aria-label="Lukk" remove={['parent']} add={docView?.current ? docView.current : {}}><PiX aria-hidden="true"/></Clickable>
                </div>}
            </div>}

            {fields.length === 0 ? (
                <div className="instance-info">
                    <ul className="!p-0 divide-y divide-neutral-200">
                        {childrenData?.map((hit: any) => (
                            <li key={hit._id}>
                                <Clickable link aria-current={doc==hit._source?.uuid ? 'page' : false} 
                                    className="no-underline !flex !w-full p-2 !h-full items-center gap-2"
                                    add={{ doc: hit._source?.uuid }}>
                                    {doc == hit._source?.uuid ? 
                                        <PiInfoFill className="text-accent-800 text-xl" aria-hidden="true"/> : 
                                        <PiInfo className="text-primary-600 text-xl" aria-hidden="true"/>
                                    }
                                    <span>
                                        {Array.isArray(hit._source?.[leaf]) ? hit._source?.[leaf]?.join(", ") : hit._source?.[leaf]}{' '}
                                        {Array.isArray(hit._source?.cadastre?.[0]?.bnr) ? hit._source?.cadastre?.[0]?.bnr?.join(", ") : hit._source?.cadastre?.[0]?.bnr}{' '}
                                        {hit._source?.label}
                                    </span>
                                </Clickable>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="overflow-x-auto border border-neutral-300 rounded-md mb-2">
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
                            {childrenData?.map((hit: any) => (
                                <tr key={hit._id}>
                                    <th className="!p-0">
                                    <Clickable link aria-current={doc==hit._source?.uuid ? 'page' : false} 
                                                className={`no-underline !flex !w-full p-2 !h-full items-center gap-2`}
                                                add={{ doc: hit._source?.uuid }}>
                                    { doc == hit._source?.uuid ? <PiInfoFill className="text-accent-800 text-xl" aria-hidden="true"/> : <PiInfo className="text-primary-600 text-xl" aria-hidden="true"/>}
                                        {Array.isArray(hit._source?.[leaf]) ? hit._source?.[leaf]?.join(", ") : hit._source?.[leaf]}{' '}
                                        {Array.isArray(hit._source?.cadastre?.[0]?.bnr) ? hit._source?.cadastre?.[0]?.bnr?.join(", ") : hit._source?.cadastre?.[0]?.bnr}{' '}
                                        {hit._source?.label}
                                    
                                        
                                                                
                                                                
                                        </Clickable>
                                    </th>
                                    {fields.map((field: Record<string, any>) => (
                                        <td className="p-2" key={field.key}>{getValueByPath(hit._source, field.key)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
    </>
    )
}
