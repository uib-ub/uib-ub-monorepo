'use client'
import { fieldConfig } from "@/config/search-config"
import { getBnr, getFieldValue } from "@/lib/utils"
import Link from 'next/link'
import { PiMapPinFill } from "react-icons/pi"
import Clickable from "../ui/clickable/clickable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"



export default function CadastralSubdivisions({ dataset, doc, childrenData, landingPage }: { dataset: string, doc: string | null, childrenData: any[] | null, landingPage: boolean }) {
    if (!doc || !childrenData) {
        return null
    }

    const datasetFieldConfig = fieldConfig?.[dataset] || {}
    const fields = Object.entries(datasetFieldConfig).filter(([key, value]: any) => value?.cadastreTable).map(([key, value]: any) => {
        return { key, label: value.label }
    })


    const LinkWrapper = ({ uuid, children }: { uuid?: string, children: React.ReactNode }) => {
        if (!uuid) return <>{children}</>
        const commonProps = {
            'aria-current': doc == uuid ? ('page' as const) : undefined,
            className: "group no-underline flex gap-1 items-center rounded-full"
        }

        return landingPage ? (
            <Link href={`/uuid/${uuid}`} {...commonProps}>
                {children}
            </Link>
        ) : (
            <Clickable link add={{ doc: uuid }} {...commonProps}>
                {children}
            </Clickable>
        )
    }

    return (
        <>
            <TooltipProvider>
                <div className="overflow-x-auto border border-neutral-300 rounded-md mb-2 mt-3 bg-white">
                    <table className="w-full border-collapse table-fixed text-sm">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="w-10 px-2 py-2 text-left font-semibold text-neutral-800"></th>
                                <th className="px-2 py-2 text-left font-semibold text-neutral-800">Bruk</th>
                                {fields.map((field: Record<string, any>) => (
                                    <th className="px-2 py-2 text-left font-semibold text-neutral-800" key={field.key}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="truncate block cursor-help">{field.label}</span>
                                            </TooltipTrigger>
                                            <TooltipContent>{field.label}</TooltipContent>
                                        </Tooltip>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {childrenData?.map((hit: any, index: number) => {
                                const hitUuid = getFieldValue(hit, 'uuid')?.[0]
                                const label = getFieldValue(hit, 'label')?.[0]
                                const bnrText = getBnr(hit, dataset)
                                const coords = getFieldValue(hit, 'location')?.[0]?.coordinates
                                const activePoint = Array.isArray(coords) && coords.length === 2
                                    ? `${coords[1]},${coords[0]}`
                                    : null

                                return (
                                    <tr key={index} className="border-t border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-2 py-1.5 align-middle">
                                            {activePoint ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Clickable
                                                            link
                                                            add={{ activePoint }}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-100 text-neutral-700"
                                                            aria-label="Vis punkt på kart"
                                                        >
                                                            <PiMapPinFill className="text-lg" aria-hidden="true" />
                                                        </Clickable>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Vis punkt på kart</TooltipContent>
                                                </Tooltip>
                                            ) : null}
                                        </td>
                                        <td className="px-2 py-1.5 align-middle truncate">
                                            <LinkWrapper uuid={hitUuid}>
                                                <span className="text-neutral-900 hover:text-neutral-700 decoration-1 underline-offset-2 hover:underline">
                                                    <span className="tabular-nums font-medium">{bnrText ? `${bnrText} ` : ''}</span>
                                                    {label}
                                                </span>
                                            </LinkWrapper>
                                        </td>
                                        {fields.map((field: Record<string, any>) => {
                                            const value = getFieldValue(hit, field.key)
                                            const displayValue = Array.isArray(value) ? value.join(', ') : (value || '')
                                            return (
                                                <td className="px-2 py-1.5 align-middle text-neutral-800 truncate" key={field.key}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="block truncate cursor-help">{displayValue}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{displayValue || 'Ingen verdi'}</TooltipContent>
                                                    </Tooltip>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </TooltipProvider>
        </>
    )
}
