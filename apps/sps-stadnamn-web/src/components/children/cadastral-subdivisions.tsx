'use client'
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useQueryState } from "nuqs"
import { useContext, useState } from "react"
import { PiFileFill, PiInfo, PiInfoFill, PiX } from "react-icons/pi"
import Clickable from "../ui/clickable/clickable"
import { getValueByPath } from "@/lib/utils"
import { ChildrenContext } from "@/app/children-provider"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"
import { GlobalContext } from "@/app/global-provider"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"


export default function CadastralSubdivisions() {
    const dataset = useDataset()
    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const { leaf  } = treeSettings[dataset]

    const { childrenData, childrenLoading } = useContext(ChildrenContext)


    return (
    <>
            {fields.length === 0 ? (
                <div className="instance-info">
                    <ul className="!p-0 !pb-8 divide-y divide-neutral-200 gap-2">
                        {childrenData?.map((hit: any) => (
                            <li key={hit._id}>
                                <span className="flex items-center gap-2">
                                    <ClickableIcon 
                                        link
                                        label="Vis bruk"
                                        aria-current={doc == hit.fields?.uuid?.[0] ? 'page' : undefined}
                                        className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                                        add={{ doc: hit.fields?.uuid?.[0] }}>
                                        <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-xl" />
                                    </ClickableIcon>
                                    <span>
                                        {Array.isArray(hit.fields?.[leaf]) ? hit.fields?.[leaf]?.join(", ") : hit.fields?.[leaf]?.[0]}{' '}
                                        {Array.isArray(hit.fields?.['cadastre.bnr']) ? hit.fields?.['cadastre.bnr']?.join(", ") : hit.fields?.['cadastre.bnr']?.[0]}{' '}
                                        {hit.fields?.label?.[0]}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="overflow-x-auto border border-neutral-300 rounded-md mb-2 mt-3">
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
                                        <span className="flex items-center gap-2 p-2">
                                            <ClickableIcon 
                                                link
                                                label="Vis bruk"
                                                aria-current={doc == hit.fields?.uuid?.[0] ? 'page' : undefined}
                                                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                                                add={{ doc: hit.fields?.uuid?.[0] }}>
                                                <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-2xl" />
                                            </ClickableIcon>
                                            <span>
                                                {hit.fields?.[leaf] || hit.fields.cadastre[0].bnr.join(", ")}&nbsp;{hit.fields?.label?.[0]}
                                            </span>
                                        </span>
                                    </th>
                                    {fields.map((field: Record<string, any>) => (
                                        <td className="p-2" key={field.key}>{getValueByPath(hit.fields, field.key)?.[0]}</td>
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
