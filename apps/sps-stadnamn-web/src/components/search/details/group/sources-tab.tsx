"use client";

import { Fragment, useContext, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PiInfoFill, PiMapPinFill } from "react-icons/pi";
import { datasetTitles } from "@/config/metadata-config";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { matchesActiveYear, matchesActiveName, matchesActivePoint } from "./group-utils";

interface SourcesTabProps {
    datasets: Record<string, any[]>;
    isFiltered: boolean;
    isInitGroup: boolean;
}

export const SourcesTab = ({ datasets, isFiltered, isInitGroup }: SourcesTabProps) => {
    const [showAll, setShowAll] = useState(false)
    // Parents whose children are fully expanded (show all bruk, not just 2)
    const [showAllChildrenParents, setShowAllChildrenParents] = useState<Set<string>>(new Set())
    const datasetKeys = useMemo(() => Object.keys(datasets).filter(ds => datasets[ds] && datasets[ds].length > 0), [datasets])
    const { sosiVocab, coordinateVocab, mapFunctionRef } = useContext(GlobalContext)

    // If not filtered: show 2 datasets if more than 3, otherwise show all
    // If filtered: show 4 datasets if more than 5, otherwise show all
    const hasMore = isFiltered ? datasetKeys.length > 5 : datasetKeys.length > 3
    const visibleCount = isFiltered ? (hasMore ? 4 : datasetKeys.length) : (hasMore ? 2 : datasetKeys.length)
    const visibleDatasets = showAll ? datasetKeys : datasetKeys.slice(0, visibleCount)
    const searchParams = useSearchParams()
    const activePoint = searchParams.get('activePoint')

    // Toggle whether a parent shows ALL its children (bruk) or only the first 2
    const toggleShowAllChildren = (uuid: string) => {
        setShowAllChildrenParents(prev => {
            const next = new Set(prev)
            if (next.has(uuid)) {
                next.delete(uuid)
            } else {
                next.add(uuid)
            }
            return next
        })
    }

    // Reuse the existing item markup for both parents (gard) and children (bruk).
    // The optional role is used only for cadastre prefixing.
    const renderItem = (
        s: any,
        ds: string,
        isInitGroup: boolean,
        activePoint: string | null,
        indentLevel: number = 0,
        role?: 'parent' | 'child'
    ) => {
        const additionalLabels = Array.from(
            new Set([
                ...(s.altLabels ?? []),
                ...(s.attestations?.map((a: any) => a.label) ?? [])
            ].filter((l: any) => l && l !== s.label))
        ).join(", ")

        // Collect and format sosi types
        const sosiTypesRaw = s.sosi
            ? (Array.isArray(s.sosi) ? s.sosi : [s.sosi]).filter((sosi: string) => sosi)
            : []
        const sosiTypes = sosiTypesRaw.map((type: string) => sosiVocab?.[type]?.label || type)
        const sosiTypesDisplay = sosiTypes.length > 0 ? ` (${sosiTypes.join(', ')})` : ''

        const lat = s.location?.coordinates?.[1];
        const lng = s.location?.coordinates?.[0];
        const isActive = activePoint && lat && lng && activePoint === `${lat},${lng}`;
        const coordinateTypeLabel = s.coordinateType && coordinateVocab?.[s.coordinateType]?.label;

        // Cadastre prefix: gnr on parent (gard), bnr on child (bruk)
        let cadastrePrefix = ''
        const cad = s.cadastre
        if (cad) {
            const first = Array.isArray(cad) ? cad[0] : cad
            if (role === 'parent' && first?.gnr != null) {
                const gnr = first.gnr
                const gnrText = Array.isArray(gnr) ? gnr.join(',') : String(gnr)
                if (gnrText && gnrText !== '0') {
                    cadastrePrefix = `${gnrText} `
                }
            } else if (role === 'child' && first?.bnr != null) {
                const bnr = first.bnr
                const bnrText = Array.isArray(bnr) ? bnr.join(',') : String(bnr)
                if (bnrText && bnrText !== '0') {
                    cadastrePrefix = `${bnrText} `
                }
            }
        }

        const indentStyle = indentLevel > 0 ? { paddingLeft: `${indentLevel * 1.5}rem` } : undefined

        return (
            <li key={s.uuid} className="py-1 flex items-center gap-2" style={indentStyle}>
                {isInitGroup && !activePoint && s.location?.coordinates?.length === 2 && (
                    <ClickableIcon
                        label="Koordinatdetaljar"
                        onClick={() => {
                            mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
                        }}
                        add={{
                            activePoint: `${lat},${lng}`,

                        }}
                        className={`flex-shrink-0 p-1 rounded-full ${isActive ? 'text-accent-700 outline outline-1 outline-accent-700 bg-accent-50' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                        <PiMapPinFill className="text-base text-neutral-600" />
                    </ClickableIcon>
                )}
                <div className="flex-1 min-w-0">
                    <div>
                        <Link className="no-underline hover:underline" href={"/uuid/" + s.uuid}>
                            <strong>{cadastrePrefix}{s.label}</strong>
                        </Link>
                        {sosiTypesDisplay && <span className="text-neutral-900">{sosiTypesDisplay}</span>}
                        {additionalLabels && <span className="text-neutral-900"> – {additionalLabels}</span>}
                        {resultRenderers[ds]?.links?.(s) || defaultResultRenderer?.links?.(s)}
                    </div>
                    {isInitGroup && activePoint && lat && lng && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 mt-0.5 w-full">{coordinateTypeLabel || "Opphavleg koordinat i " + datasetTitles[ds]} </div>
                    )}
                </div>
            </li>
        )
    }

    return (
        <ul className="flex flex-col w-full gap-4 pt-4">
            {visibleDatasets.map((ds) => {
                const items = datasets[ds] || []
                if (items.length === 0) return null

                // Build parent/child relations within this dataset
                const itemMap = new Map<string, any>()
                items.forEach((item: any) => {
                    if (item.uuid) {
                        itemMap.set(item.uuid, item)
                    }
                })

                const childrenMap = new Map<string, any[]>()
                const rootItems: any[] = []

                items.forEach((item: any) => {
                    const parentUuid = item.within
                    if (parentUuid && itemMap.has(parentUuid)) {
                        if (!childrenMap.has(parentUuid)) {
                            childrenMap.set(parentUuid, [])
                        }
                        childrenMap.get(parentUuid)!.push(item)
                    } else {
                        rootItems.push(item)
                    }
                })

                const hasNesting = childrenMap.size > 0

                return (
                    <li key={`sources-ds-${ds}`} className="flex flex-col w-full gap-1">
                        {searchParams.getAll('dataset').length != 1 && <div className="flex items-center gap-2 text-neutral-800 uppercase traciking-wider">
                            {datasetTitles[ds] || ds}
                            <ClickableIcon
                                href={`/info/datasets/${ds.split('_')[0]}`}
                                className="flex items-center"
                                label="Om datasettet"
                            >
                                <PiInfoFill className="text-primary-700 text-sm align-middle" aria-hidden="true" />
                            </ClickableIcon>
                        </div>}
                        <ul className="flex flex-col w-full gap-1">
                            {/* No nesting at all – behave exactly as before */}
                            {!hasNesting && items.map((s: any) => renderItem(s, ds, isInitGroup, activePoint, 0))}

                            {/* With nesting – render parents with their children */}
                            {hasNesting && rootItems.map((parent: any) => {
                                const children = childrenMap.get(parent.uuid) || []
                                const childCount = children.length

                                if (childCount === 0) {
                                    // Parent candidate with no children in this group – still show gnr prefix
                                    return renderItem(parent, ds, isInitGroup, activePoint, 0, 'parent')
                                }

                                const showAllChildren = showAllChildrenParents.has(parent.uuid)
                                const hasManyChildren = childCount > 3

                                // Visibility rules:
                                // - If 1–3 children: always show all
                                // - If >3 children and NOT showAllChildren: show 2
                                // - If >3 children and showAllChildren: show all
                                const visibleChildren = !hasManyChildren || showAllChildren
                                    ? children
                                    : children.slice(0, 2)

                                const hiddenCount = hasManyChildren && !showAllChildren
                                    ? childCount - visibleChildren.length
                                    : 0

                                return (
                                    <Fragment key={parent.uuid}>
                                        {renderItem(parent, ds, isInitGroup, activePoint, 0, 'parent')}
                                        <ul className="flex flex-col w-full gap-1">
                                            {visibleChildren.map((child: any) =>
                                                renderItem(child, ds, isInitGroup, activePoint, 1, 'child')
                                            )}
                                            {hiddenCount > 0 && (
                                                <li className="py-1" style={{ paddingLeft: `${1.5 * 1.5}rem` }}>
                                                    <button
                                                        type="button"
                                                        className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                                        onClick={() => toggleShowAllChildren(parent.uuid)}
                                                    >
                                                        Vis fleire ( + {hiddenCount} )
                                                    </button>
                                                </li>
                                            )}
                                            {hasManyChildren && showAllChildren && (
                                                <li className="py-1" style={{ paddingLeft: `${1.5 * 1.5}rem` }}>
                                                    <button
                                                        type="button"
                                                        className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                                        onClick={() => toggleShowAllChildren(parent.uuid)}
                                                    >
                                                        Vis færre
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </Fragment>
                                )
                            })}
                        </ul>
                    </li>
                )
            })}
            {hasMore && (
                <li className="mt-1">
                    <button
                        type="button"
                        className="text-lg text-neutral-900 flex items-center gap-1"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Færre datasett' : `Fleire datasett ( + ${datasetKeys.length - visibleCount} )`}
                    </button>
                </li>
            )}
        </ul>
    )
}

interface FilteredSourcesTabProps {
    datasets: Record<string, any[]>;
    activeYear: string | null;
    activeName: string | null;
    isInitGroup: boolean;
}

// Component that filters datasets and renders SourcesTab
export const FilteredSourcesTab = ({
    datasets,
    activeYear,
    activeName,
    isInitGroup
}: FilteredSourcesTabProps) => {
    const searchParams = useSearchParams()
    const activePoint = searchParams.get('activePoint')

    const filtered = useMemo(() => {
        const result: Record<string, any[]> = {}
        Object.keys(datasets).forEach((ds) => {
            result[ds] = (datasets[ds] || []).filter((s: any) =>
                // Only filter by activeYear, activeName, and activePoint if this is the init group
                (isInitGroup ? matchesActiveYear(s, activeYear) : true) &&
                (isInitGroup ? matchesActiveName(s, activeName) : true) &&
                (isInitGroup ? matchesActivePoint(s, activePoint) : true)
            )
        })
        return result
    }, [datasets, activeYear, activeName, activePoint, isInitGroup])

    const isFiltered = !!(activeYear || activeName || (isInitGroup && activePoint))

    return <SourcesTab datasets={filtered} isFiltered={isFiltered} isInitGroup={isInitGroup} />
}

