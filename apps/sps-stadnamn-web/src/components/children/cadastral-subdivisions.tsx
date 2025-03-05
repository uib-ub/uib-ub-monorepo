'use client'
import { fieldConfig } from "@/config/search-config"
import { treeSettings } from "@/config/server-config"
import { PiBookOpen } from "react-icons/pi"
import Clickable from "../ui/clickable/clickable"
import { getBnr, getFieldValue } from "@/lib/utils"
import Link from 'next/link'



export default function CadastralSubdivisions({ dataset, doc, childrenData, landingPage }: { dataset: string, doc: string | null, childrenData: any[] | null, landingPage: boolean }) {
    if (!doc || !childrenData) {
        return null
    }

    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })
    const { leaf  } = treeSettings[dataset]

    const LinkWrapper = ({ uuid, children }: { uuid: string, children: React.ReactNode }) => {
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

    const renderLinkContent = (hit: any) => (
        <>
            <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                <PiBookOpen className="text-primary-600 group-aria-[current='page']:text-accent-800" />
            </div>
            <span>
                {getFieldValue(hit, leaf)?.join(", ")}{' '}
                {getFieldValue(hit, 'cadastre.0.bnr')?.join(", ")}{' '}
                {getFieldValue(hit, 'label')?.[0]}
            </span>
        </>
    )

    return (
    <>
            {fields.length === 0 ? (
                <div className="instance-info">
                    <ul className="!p-0 !pb-8 divide-y divide-neutral-200 gap-2 list-none">
                        {childrenData?.map((hit: any) => (
                            <li key={hit._id}>
                                <span className="flex items-center gap-2">
                                    <LinkWrapper uuid={getFieldValue(hit, 'uuid')?.[0]}>
                                        {renderLinkContent(hit)}
                                    </LinkWrapper>
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
                                            <LinkWrapper uuid={getFieldValue(hit, 'uuid')?.[0]}>
                                                <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                                                    <PiBookOpen className="text-primary-600 group-aria-[current='page']:text-accent-800" />
                                                </div>
                                                <span>
                                                    {getBnr(hit, dataset)}&nbsp;
                                                    {getFieldValue(hit, 'label')?.[0]}
                                                </span>
                                            </LinkWrapper>
                                        </span>
                                    </th>
                                    {fields.map((field: Record<string, any>) => (
                                        <td className="p-2" key={field.key}>{getFieldValue(hit, field.key)}</td>
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
