"use client";

import { Fragment, useContext, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PiBookOpen, PiCheck, PiCheckCircle, PiFile, PiFileFill, PiInfoFill, PiMapPin, PiMapPinFill, PiX, PiXBold } from "react-icons/pi";
import { datasetTitles } from "@/config/metadata-config";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { matchesActiveYear, matchesActiveName } from "./group-utils";
import CoordinateTypeInfo from "../doc/coordinate-type-info";
import SubtleLink from "@/components/ui/clickable/subtle-link";
import { treeSettings } from "@/config/server-config";
import { panPointIntoView } from "@/lib/map-utils";
import { useActivePoint, useGroup } from "@/lib/param-hooks";
import DistanceBadge from "@/components/search/distance-badge";

interface SourcesTabProps {
    datasets: Record<string, any[]>;
    isFiltered: boolean;
    distanceMeters?: number | null;
}

export const SourcesTab = ({ datasets, isFiltered, distanceMeters }: SourcesTabProps) => {
    const [showAll, setShowAll] = useState(false)
    // Parents whose children are fully expanded (show all bruk, not just 2)
    const [showAllChildrenParents, setShowAllChildrenParents] = useState<Set<string>>(new Set())
    const datasetKeys = useMemo(() => Object.keys(datasets).filter(ds => datasets[ds] && datasets[ds].length > 0), [datasets])
    const { sosiVocab, mapFunctionRef, isMobile } = useContext(GlobalContext)
    const { initValue } = useGroup()

    const searchParams = useSearchParams()
    const center = searchParams.get('center')
    const zoom = searchParams.get('zoom')
    const coordinateInfo = searchParams.get('coordinateInfo') == 'on'
    const labelFilter = searchParams.get('labelFilter') === 'on'
    const noGrouping = searchParams.get('noGrouping') === 'on'
    const activePoint = useActivePoint()
    // If not filtered: show 2 datasets if more than 3, otherwise show all
    // If filtered: show 4 datasets if more than 5, otherwise show all
    const hasMore = isFiltered ? datasetKeys.length > 5 : datasetKeys.length > 3
    const visibleCount = isFiltered ? (hasMore ? 4 : datasetKeys.length) : (hasMore ? 2 : datasetKeys.length)
    const visibleDatasets = (coordinateInfo || labelFilter)
        ? datasetKeys
        : (showAll ? datasetKeys : datasetKeys.slice(0, visibleCount))

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

    const firstValue = (v: any) => Array.isArray(v) ? v[0] : v
    const toPrefix = (v: any) => {
        const x = firstValue(v)
        if (x == null) return ''
        const s = String(x)
        if (!s || s === '0') return ''
        return `${s} `
    }

    // Reuse the existing item markup for both parents (gard) and children (bruk).
    // The optional role is used only for cadastre prefixing.
    const renderItem = (
        s: any,
        ds: string,
        indentLevel: number = 0,
        role?: 'parent' | 'child',
        showMatrikkelvising: boolean = true,
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
        const sosiTypesDisplay = sosiTypes.length > 0 ? ` ${sosiTypes.join(', ')}` : ''

        const lat = s.location?.coordinates?.[1];
        const lng = s.location?.coordinates?.[0];
        const coordinateInfo = searchParams.get('coordinateInfo') == 'on'

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

        // Special-case: Matrikkelen 1838 uses misc.MNR (matrikkelnummer) and misc.LNR (løpenummer)
        // rather than standard cadastre.gnr/bnr. Fall back to these for prefixing.
        if (!cadastrePrefix && ds === 'm1838') {
            if (role === 'parent') cadastrePrefix = toPrefix(s?.misc?.MNR ?? s?.misc?.mnr ?? s?.mnr)
            if (role === 'child') cadastrePrefix = toPrefix(s?.misc?.LNR ?? s?.misc?.lnr ?? s?.lnr)
        }

        const indentStyle = indentLevel > 0 ? { paddingLeft: `${indentLevel * 1.5}rem` } : undefined
        const links = resultRenderers[ds]?.links?.(s) || defaultResultRenderer?.links?.(s)
        // Tree view button removed (now available in the top mode/menu bar).

        return (
            <li key={s.uuid} className="flex flex-col gap-1" style={indentStyle}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 leading-6 min-h-6">
                        {noGrouping && (
                            <div className="flex items-center shrink-0 -mr-2">
                                
                                {lat != null && lng != null && (
                                    <ClickableIcon
                                        label="Sett aktivt punkt"
                                        add={{ activePoint: `${lat},${lng}` }}
                                        onClick={() => panPointIntoView(mapFunctionRef.current, [lat, lng], isMobile, isMobile)}
                                        className="h-8 w-8 p-0 rounded-md btn-compact text-neutral-700"
                                    >
                                        {activePoint && activePoint[0] === lat && activePoint[1] === lng ? <PiMapPinFill className="text-2xl text-accent-800" aria-hidden /> : <PiMapPin className="text-2xl" aria-hidden />}
                                    </ClickableIcon>
                                )}
                                
                            </div>
                        )}
                        <Link
                            className="no-underline flex items-center gap-1 hover:bg-neutral-100 rounded-md py-1 !px-3 btn btn-outline btn-compact text-lg min-w-0"
                            href={"/uuid/" + s.uuid}
                        >
                            <span className="flex items-baseline gap-1 min-w-0 max-w-full">
                                {cadastrePrefix && (
                                    <span className="shrink-0 text-neutral-950">
                                        {cadastrePrefix}
                                    </span>
                                )}
                                <strong className="truncate min-w-0 text-neutral-950">
                                    {s.label}
                                </strong>
                                {sosiTypesDisplay && (
                                    <span className="text-neutral-900 text-sm truncate max-w-[40%]">
                                        {sosiTypesDisplay}
                                    </span>
                                )}
                            </span>
                        </Link>

                        {additionalLabels && <span className="text-neutral-900">{additionalLabels}</span>}
                        {s.phonetic && <span className="text-neutral-900">{s.phonetic}</span>}
                        {s.content?.note && <span className="text-neutral-900">{s.content.note}</span>}
                        {/* Keep source links on the same line when there is available space; wrap naturally when needed */}
                        {links}
                    </div>

                    {(coordinateInfo || (noGrouping && activePoint && activePoint[0] === lat && activePoint[1] === lng)) && lat && lng && (
                        <div className="mt-0.5 min-w-0 w-full rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
                            {s.coordinateType ? (
                                <CoordinateTypeInfo coordinateType={s.coordinateType} />
                            ) : (
                                <span className="text-sm text-neutral-700">Opphavleg koordinat i {datasetTitles[ds]}</span>
                            )}
                        </div>
                    )}
                    {showMatrikkelvising && s.sosi == 'gard' && treeSettings[ds] && (
                        <SubtleLink className="pb-4 pt-2" link only={{ tree: `${ds}_${s.adm1}_${s.adm2}_${s.uuid}`, center, zoom }}>
                            Vis i matrikkelen
                        </SubtleLink>
                    )}
            </li>
        )
    }

    const renderMatrikkelvisingForParent = (parent: any, ds: string) => {
        if (parent.sosi !== 'gard' || !treeSettings[ds]) return null
        return (
            <li className="pb-4 pt-2">
                <SubtleLink link only={{ tree: `${ds}_${parent.adm1}_${parent.adm2}_${parent.uuid}`, center, zoom }}>
                    Vis i matrikkelen
                </SubtleLink>
            </li>
        )
    }

    return (
        <ul className="flex flex-col gap-8 py-4 w-full">
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

                const showDistance = noGrouping && typeof distanceMeters === 'number';

                return (
                    <li key={`sources-ds-${ds}`} className="flex flex-col w-full gap-4">
                        
                            <div className="flex items-center w-full justify-between">
                                <span className="text-neutral-800 uppercase traciking-wider">{datasetTitles[ds] || ds}</span>
                                <div className="ml-auto flex items-center gap-1">
                                    {showDistance && <DistanceBadge meters={distanceMeters} />}

                                    { noGrouping && <>
                                    <ClickableIcon
                                    label={initValue === items[0].uuid ? "Fjern utgangspunkt" : "Sett som utgangspunkt"}
                                    add={{ init: initValue === items[0].uuid ? null : items[0].uuid }}
                                    className="h-6 w-6 p-0 btn btn-outline rounded-full text-neutral-900"
                                >
                                    {initValue == items[0].uuid ? <PiXBold aria-hidden="true" /> : <PiCheck aria-hidden="true" />}
                                </ClickableIcon>

                                </>}
                                </div>
                            </div>
              
                        <ul className="flex flex-col w-full gap-4">
                            {/* No nesting at all – show gnr for standalone items */}
                            {!hasNesting && items.map((s: any) => renderItem(s, ds, 0, 'parent'))}

                            {/* With nesting – always render parents with their children (subunits/bruk) */}
                            {hasNesting && rootItems.map((parent: any) => {
                                const children = childrenMap.get(parent.uuid) || []
                                const childCount = children.length

                                if (childCount === 0) {
                                    // Parent candidate with no children in this group – still show gnr prefix and Matrikkelvising below
                                    return (
                                        <Fragment key={parent.uuid}>
                                            {renderItem(parent, ds, 0, 'parent', false)}
                                            {renderMatrikkelvisingForParent(parent, ds)}
                                        </Fragment>
                                    )
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
                                        {renderItem(parent, ds, 0, 'parent', false)}
                                        <ul className="flex flex-col w-full gap-2 -mt-2">
                                            {visibleChildren.map((child: any) =>
                                                renderItem(child, ds, 1, 'child')
                                            )}
                                            {hiddenCount > 0 && (
                                                <li className="pl-9">
                                                    <button
                                                        type="button"
                                                        className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                                        onClick={() => toggleShowAllChildren(parent.uuid)}
                                                    >
                                                        Vis fleire ({hiddenCount})
                                                    </button>
                                                </li>
                                            )}
                                            {hasManyChildren && showAllChildren && (
                                                <li className="pl-9">
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
                                        {renderMatrikkelvisingForParent(parent, ds)}
                                    </Fragment>
                                )
                            })}
                        </ul>
                        
                    </li>
                )
            })}
            {hasMore && !coordinateInfo && !labelFilter && (
                <li className="mt-1">
                    <button
                        type="button"
                        className="text-lg text-neutral-900 flex items-center gap-1"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Færre datasett' : `Fleire datasett (${datasetKeys.length - visibleCount})`}
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
    distanceMeters?: number | null;
}

// Component that filters datasets and renders SourcesTab
export const FilteredSourcesTab = ({
    datasets,
    activeYear,
    activeName,
    isInitGroup,
    distanceMeters,
}: FilteredSourcesTabProps) => {
    const searchParams = useSearchParams()
    const activePoint = useActivePoint()

    const coordinateInfo = searchParams.get('coordinateInfo') == 'on'

    const filtered = useMemo(() => {
        const result: Record<string, any[]> = {}
        Object.keys(datasets).forEach((ds) => {
            result[ds] = (datasets[ds] || []).filter((s: any) =>
                // Only filter by activeYear, activeName, and activePoint if this is the init group
                (isInitGroup ? matchesActiveYear(s, activeYear) : true) &&
                (isInitGroup ? matchesActiveName(s, activeName) : true) &&
                (coordinateInfo ? s.location?.coordinates?.[0] == activePoint?.[1] && s.location?.coordinates?.[1] == activePoint?.[0] : true)
            )
        })
        return result
    }, [datasets, activeYear, activeName, activePoint, isInitGroup])

    const isFiltered = !!(activeYear || activeName || (isInitGroup && activePoint))

    return (
        <SourcesTab
            datasets={filtered}
            isFiltered={isFiltered}
            distanceMeters={distanceMeters}
        />
    )
}

