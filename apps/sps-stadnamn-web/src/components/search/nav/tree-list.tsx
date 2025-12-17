import { treeSettings } from "@/config/server-config"
import { getGnr, getSkeletonLength } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import Clickable from "../../ui/clickable/clickable"
import { buildTreeParam } from "@/lib/tree-param"
import { useQueryClient } from "@tanstack/react-query"
import CadastralTable from "../details/doc/cadastral-table"
import { stringToBase64Url } from "@/lib/param-utils"
import { useEffect } from "react"

const getTreeData = async (dataset: string | null, adm1?: string | null, adm2?: string | null) => {
    const params = new URLSearchParams()
    if (adm1) params.set('adm1', adm1)
    if (adm2) params.set('adm2', adm2)

    if (!dataset) return null


    params.set('dataset', dataset)

    const res = await fetch(`/api/tree?${params.toString()}`)
    const data = await res.json()
    return data
}

export default function TreeList({
    dataset,
    adm1,
    adm2,
    expandedUuid
}: {
    dataset: string
    adm1?: string
    adm2?: string
    expandedUuid?: string | null
}) {
    const removeLegacyParams = ['dataset', 'adm1', 'adm2', 'doc']
    const queryClient = useQueryClient()

    const { data: treeData } = useQuery({
        queryKey: ['treeData', dataset, adm1, adm2],
        queryFn: () => getTreeData(dataset, adm1, adm2),
        enabled: !!dataset
    })

    useEffect(() => {
        // When opening matrikkelvisning directly on a uuid, ensure that row is visible.
        // This scrolls the right panel (TreeWindow) to the expanded cadastral unit.
        if (!adm2 || !expandedUuid) return
        if (!treeData?.hits?.hits?.length) return

        const id = `tree-item-${expandedUuid}`
        // Defer one frame so the expanded content is mounted before measuring/scrolling.
        requestAnimationFrame(() => {
            const el = document.getElementById(id)
            el?.scrollIntoView({ behavior: 'instant' as any, block: 'center' })
        })
    }, [adm2, expandedUuid, treeData?.hits?.hits?.length])

    if (!treeData?.hits?.hits) {
        return (
            <ul className="list-none divide-y divide-neutral-200">
                {[...Array(8)].map((_, i) => (
                    <li key={i}>
                        <div className="flex items-center p-3">
                            <div
                                className="h-4 bg-neutral-900/10 rounded-full animate-pulse"
                                style={{ width: `${getSkeletonLength(i, 8, 16)}rem` }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        )
    }

    const settings = treeSettings[dataset]

    return (

        <ul className="list-none divide-y divide-neutral-200">
            {treeData.hits.hits.map((item: any) => {
                const fields = item.fields

                // If we're at adm2 level, show cadastral units (farms). Click goes to uuid level.
                if (adm2) {
                    const gnr = getGnr(item, dataset)
                    const farmName = fields[settings.parentName]?.[0] || fields.label?.[0]
                    const itemUuid = fields.uuid?.[0]
                    const isExpanded = !!expandedUuid && !!itemUuid && expandedUuid === itemUuid
                    const groupId = fields?.["group.id"]?.[0]
                    const coords = fields?.location?.[0]?.coordinates
                    const activePoint = Array.isArray(coords) && coords.length === 2
                        ? `${coords[1]},${coords[0]}`
                        : undefined

                    return (
                        <li
                            key={item._id}
                        >
                            <Clickable
                                link
                                id={itemUuid ? `tree-item-${itemUuid}` : undefined}
                                onClick={() => {
                                    if (!isExpanded) {
                                        // Prefill the selected-doc cache so breadcrumbs/title can render instantly.
                                        // Keep this lightweight: label + location + group id + number (for breadcrumb + map).
                                        const numberText = Array.isArray(gnr) ? gnr.join(", ") : (gnr?.toString?.() || gnr || '')
                                        if (itemUuid) {
                                            queryClient.setQueryData(['treeSelectedDoc', dataset, itemUuid], {
                                                label: farmName,
                                                ...(coords ? { location: { coordinates: coords } } : {}),
                                                ...(groupId ? { group: { id: groupId } } : {}),
                                                ...(numberText ? { __treeNumber: numberText } : {}),
                                            })
                                        }
                                    }
                                }}
                                remove={removeLegacyParams}
                                add={{
                                    tree: isExpanded
                                        ? buildTreeParam({ dataset, adm1, adm2 })
                                        : buildTreeParam({ dataset, adm1, adm2, uuid: itemUuid }),
                                    ...(groupId ? { group: stringToBase64Url(groupId) } : {}),
                                    ...(activePoint ? { activePoint } : {}),
                                }}
                                className="flex items-center p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full aria-[current='page']:bg-accent-50"
                            >
                                <span className="text-black">
                                    {gnr ? `${gnr} ` : ''}{farmName}
                                </span>
                            </Clickable>
                            {isExpanded && (
                                <div className="pb-3">
                                    <div className="ml-0 mt-1">
                                        <CadastralTable dataset={dataset} uuid={itemUuid} list={true} flush={true} groupId={groupId} gnr={gnr} adm1={adm1} adm2={adm2} />
                                    </div>
                                </div>
                            )}
                        </li>
                    )
                }

                // If we're at adm1 level, show municipalities. Click goes to adm2 level.
                if (adm1) {
                    const municipalityNumber = fields[settings.aggSort]?.[0]
                    const municipalityName = fields['adm2']
                    return (
                        <li key={item._id}>
                            <Clickable
                                link
                                remove={removeLegacyParams}
                                add={{
                                    tree: buildTreeParam({ dataset, adm1, adm2: fields.adm2?.[0] })
                                }}
                                className="flex items-center justify-between p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full"
                            >
                                <span className="flex-1 text-black">
                                    {settings.showNumber ? `${municipalityNumber} ` : ''}{municipalityName}
                                </span>
                            </Clickable>
                        </li>
                    )
                }

                // At dataset level, show counties. Click goes to adm1 level.
                const countyName = fields.adm1?.[0]
                const municipalityNumber = fields[settings.aggSort]?.[0]
                const countyNumber = municipalityNumber?.substring(0, 2)

                return (
                    <li key={item._id}>
                        <Clickable
                            link
                            remove={removeLegacyParams}
                            add={{
                                tree: buildTreeParam({ dataset, adm1: countyName })
                            }}
                            className="flex items-center justify-between p-3 hover:bg-neutral-50 focus:bg-neutral-50 transition-colors no-underline w-full"
                        >
                            <span className="flex-1 text-black">
                                {settings.showNumber ? `${countyNumber} ` : ''}{countyName}
                            </span>
                        </Clickable>
                    </li>
                )
            })}
        </ul>
    )
}