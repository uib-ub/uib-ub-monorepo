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
                    <ul className="!p-0 divide-y divide-neutral-200">
                        {childrenData?.map((hit: any) => (
                            <li key={hit._id}>
                                <span className="flex items-center gap-2">
                                    <ClickableIcon 
                                        link
                                        label="Vis bruk"
                                        aria-current={doc == hit._source?.uuid ? 'page' : undefined}
                                        className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                                        add={{ doc: hit._source?.uuid }}>
                                        <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-xl" />
                                    </ClickableIcon>
                                    <span>
                                        {Array.isArray(hit._source?.[leaf]) ? hit._source?.[leaf]?.join(", ") : hit._source?.[leaf]}{' '}
                                        {Array.isArray(hit._source?.cadastre?.[0]?.bnr) ? hit._source?.cadastre?.[0]?.bnr?.join(", ") : hit._source?.cadastre?.[0]?.bnr}{' '}
                                        {hit._source?.label}
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
                                                aria-current={doc == hit._source?.uuid ? 'page' : undefined}
                                                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                                                add={{ doc: hit._source?.uuid }}>
                                                <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-2xl" />
                                            </ClickableIcon>
                                            <span>
                                                {Array.isArray(hit._source?.[leaf]) ? hit._source?.[leaf]?.join(", ") : hit._source?.[leaf]}{' '}
                                                {Array.isArray(hit._source?.cadastre?.[0]?.bnr) ? hit._source?.cadastre?.[0]?.bnr?.join(", ") : hit._source?.cadastre?.[0]?.bnr}{' '}
                                                {hit._source?.label}
                                            </span>
                                        </span>
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
