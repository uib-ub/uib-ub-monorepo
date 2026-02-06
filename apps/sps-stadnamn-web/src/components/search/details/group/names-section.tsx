"use client"

import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PiX } from "react-icons/pi";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import InfoPopover from "@/components/ui/info-popover";

interface NamesSectionProps {
    datasets: Record<string, any[]>;
}

export const NamesSection = ({ datasets }: NamesSectionProps) => {
    const [showAll, setShowAll] = useState(false)
    const searchParams = useSearchParams()
    const activeYear = searchParams.get('activeYear')
    const activeName = searchParams.get('activeName')

    const { yearsOrdered, namesByYear, namesWithoutYear, nameCounts } = useMemo(() => {
        // Helper functions to check if source matches filters
        const matchesYear = (source: any) => {
            if (!activeYear) return true
            if (String(source?.year) === activeYear) return true
            if (Array.isArray(source?.attestations)) {
                if (source.attestations.some((a: any) => String(a?.year) === activeYear)) return true
            }
            return false
        }

        const matchesName = (source: any) => {
            if (!activeName) return true
            if (source?.label && String(source.label) === activeName) return true
            if (Array.isArray(source?.altLabels)) {
                if (source.altLabels.some((al: any) => String(typeof al === 'string' ? al : al?.label) === activeName)) return true
            }
            if (Array.isArray(source?.attestations)) {
                if (source.attestations.some((a: any) => String(a?.label) === activeName)) return true
            }
            return false
        }

        // 1) Empty structures
        const nameToYears: Record<string, Set<string>> = {}
        const nameCounts: Record<string, number> = {}

        // 2) Build lookup from labels/altLabels (using source.year) and attestations (using att.year)
        const pushNameYear = (name: string | undefined, year: any, source: any) => {
            if (!name) return
            // Only include if source matches all active filters
            if (!matchesYear(source)) return
            if (!matchesName(source)) return
            const y = year != null ? String(year) : null
            // Skip clearly invalid/typo years that start with 0 (e.g. "0990")
            if (!y || y.startsWith('0')) return
            nameToYears[name] = nameToYears[name] || new Set<string>()
            nameToYears[name].add(y)
            nameCounts[name] = (nameCounts[name] || 0) + 1
        }

        Object.entries(datasets).forEach(([, sources]) => {
            sources.forEach((source: any) => {
                // Labels and altLabels only when source.year exists
                if (source?.year) {
                    pushNameYear(source.label, source.year, source)
                    if (Array.isArray(source?.altLabels)) {
                        source.altLabels.forEach((alt: any) => pushNameYear(typeof alt === 'string' ? alt : alt?.label, source.year, source))
                    }
                }
                // Attestations: use their own year
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => pushNameYear(att?.label, att?.year, source))
                }
            })
        })

        // 3) Compute earliest occurrence per name and bucket names by that year
        const namesByYear: Record<string, string[]> = {}
        const namesWithoutYear: string[] = []
        Object.entries(nameToYears).forEach(([name, yearsSet]) => {
            const years = Array.from(yearsSet)
            if (years.length === 0) {
                namesWithoutYear.push(name)
                return
            }
            const numeric = years
                .map((y) => ({ raw: y, num: Number(y) }))
                .filter((y) => !Number.isNaN(y.num))
                .sort((a, b) => a.num - b.num)
            const earliest = numeric.length ? numeric[0].raw : years.sort()[0]
            namesByYear[earliest] = namesByYear[earliest] || []
            namesByYear[earliest].push(name)
        })
        Object.keys(namesByYear).forEach((y) => namesByYear[y].sort())
        const yearsOrdered = Object.keys(namesByYear)
            .map((y) => {
                // Keep leading-zero years as-is (e.g. "0990"), don't coerce to number
                if (typeof y === 'string' && y.startsWith('0')) return y
                const n = Number(y)
                return Number.isNaN(n) ? y : n
            })
            .sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0))
            .map(String)

        return { yearsOrdered, namesByYear, namesWithoutYear, nameCounts }
    }, [datasets, activeYear, activeName])

    // Rebuild filtered data based on active filters
    const { filteredYearsOrdered, filteredNamesByYear, filteredNamesWithoutYear } = useMemo(() => {
        if (!activeYear && !activeName) {
            // No filter: show everything
            return {
                filteredYearsOrdered: yearsOrdered,
                filteredNamesByYear: namesByYear,
                filteredNamesWithoutYear: namesWithoutYear
            }
        }

        // Build filtered name-to-years mapping
        const filteredNameToYears: Record<string, Set<string>> = {}

        Object.entries(datasets).forEach(([, sources]) => {
            sources.forEach((source: any) => {
                // Process labels and altLabels with source.year
                // Only include if: (1) source has a valid year (not starting with 0),
                // (2) if activeYear is set, source.year matches,
                // (3) if activeName is set, only add if this specific label matches
                if (source?.year) {
                    const yearStr = String(source.year)
                    // Skip clearly invalid/typo years that start with 0 (e.g. "0990")
                    if (yearStr.startsWith('0')) {
                        return
                    }
                    // Check if source.year matches activeYear filter
                    const yearMatches = !activeYear || yearStr === activeYear
                    if (yearMatches) {
                        const pushName = (name: string | undefined) => {
                            if (!name) return
                            // If activeName is set, only add this name if it matches
                            if (activeName && name !== activeName) return
                            const y = yearStr
                            filteredNameToYears[name] = filteredNameToYears[name] || new Set<string>()
                            filteredNameToYears[name].add(y)
                        }
                        pushName(source.label)
                        if (Array.isArray(source?.altLabels)) {
                            source.altLabels.forEach((alt: any) => pushName(typeof alt === 'string' ? alt : alt?.label))
                        }
                    }
                }

                // Process attestations with their own year
                // Only include if: (1) attestation has label and valid year (not starting with 0),
                // (2) if activeName is set, attestation.label matches,
                // (3) if activeYear is set, attestation.year matches
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => {
                        if (!att?.label) return
                        const y = att?.year != null ? String(att.year) : null
                        // Skip clearly invalid/typo years that start with 0 (e.g. "0990")
                        if (!y || y.startsWith('0')) return
                        // If activeName is set, only add this attestation if its label matches
                        if (activeName && att.label !== activeName) return
                        // If activeYear is set, only add if this attestation's year matches
                        if (activeYear && y !== activeYear) return
                        filteredNameToYears[att.label] = filteredNameToYears[att.label] || new Set<string>()
                        filteredNameToYears[att.label].add(y)
                    })
                }
            })
        })

        // Build filtered namesByYear
        const filteredNamesByYear: Record<string, string[]> = {}
        const filteredNamesWithoutYear: string[] = []

        Object.entries(filteredNameToYears).forEach(([name, yearsSet]) => {
            const years = Array.from(yearsSet)
            if (years.length === 0) {
                filteredNamesWithoutYear.push(name)
                return
            }

            // If this is the active name filter, show it in ALL years where it appears
            if (activeName && name === activeName) {
                years.forEach((year) => {
                    filteredNamesByYear[year] = filteredNamesByYear[year] || []
                    if (!filteredNamesByYear[year].includes(name)) {
                        filteredNamesByYear[year].push(name)
                    }
                })
            } else if (activeYear && years.includes(activeYear)) {
                // If a year is active, show names under that year (even if it's not their earliest)
                filteredNamesByYear[activeYear] = filteredNamesByYear[activeYear] || []
                if (!filteredNamesByYear[activeYear].includes(name)) {
                    filteredNamesByYear[activeYear].push(name)
                }
            } else {
                // For other names, group by earliest year (normal behavior)
                const numeric = years
                    .map((y) => ({ raw: y, num: Number(y) }))
                    .filter((y) => !Number.isNaN(y.num))
                    .sort((a, b) => a.num - b.num)
                const earliest = numeric.length ? numeric[0].raw : years.sort()[0]
                filteredNamesByYear[earliest] = filteredNamesByYear[earliest] || []
                filteredNamesByYear[earliest].push(name)
            }
        })

        Object.keys(filteredNamesByYear).forEach((y) => filteredNamesByYear[y].sort())
        const filteredYearsOrdered = Object.keys(filteredNamesByYear)
            .map((y) => {
                // Keep leading-zero years as-is (e.g. "0990"), don't coerce to number
                if (typeof y === 'string' && y.startsWith('0')) return y
                const n = Number(y)
                return Number.isNaN(n) ? y : n
            })
            .sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0))
            .map(String)

        return {
            filteredYearsOrdered,
            filteredNamesByYear,
            filteredNamesWithoutYear
        }
    }, [datasets, activeYear, activeName, yearsOrdered, namesByYear, namesWithoutYear])

    // Build filtered items list
    const filteredItems = useMemo(() => {
        return [
            ...filteredYearsOrdered.map(y => ({ type: 'year' as const, year: y, names: filteredNamesByYear[y] || [] })),
            ...filteredNamesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))
        ]
    }, [filteredYearsOrdered, filteredNamesByYear, filteredNamesWithoutYear, nameCounts])

    const hasActiveFilter = !!(activeYear || activeName)

    const allItems = [...yearsOrdered.map(y => ({ type: 'year' as const, year: y, names: namesByYear[y] || [] })), ...namesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))]
    const hasMore = !hasActiveFilter && filteredItems.length > 3
    const allYearItems = filteredItems.filter(item => item.type === 'year')
    const allNoYearItems = filteredItems.filter(item => item.type === 'noYear')

    // When collapsed and hasMore: show first year item and last year item (collapse in the middle)
    // Otherwise: show all items
    const visibleYearItems = showAll || hasActiveFilter ? allYearItems : (
        hasMore && allYearItems.length > 1
            ? [allYearItems[0], allYearItems[allYearItems.length - 1]]
            : allYearItems.slice(0, Math.min(3, allYearItems.length))
    )
    // Items without year are always shown (they're handled separately in the UI)
    const visibleNoYearItems = allNoYearItems
    const visibleItems = [...visibleYearItems, ...visibleNoYearItems]
    const isCollapsed = hasMore && !showAll && !hasActiveFilter && allYearItems.length > 1
    const hiddenYearItemsCount = allYearItems.length - visibleYearItems.length

    if (allItems.length === 0) return null

    // Determine if we should show filter options (timeline, name buttons)
    // Hide filter options if there's only one filter option total
    let shouldShowFilterOptions = true

    // Check if there's one year with one name (and no names without year)
    if (filteredYearsOrdered.length === 1 && filteredNamesWithoutYear.length === 0) {
        const yearNames = filteredNamesByYear[filteredYearsOrdered[0]] || []
        if (yearNames.length === 1) {
            shouldShowFilterOptions = false
        }
    }
    // Check if there's one name without year (and no years)
    if (filteredYearsOrdered.length === 0 && filteredNamesWithoutYear.length === 1) {
        shouldShowFilterOptions = false
    }
    // When a name is selected, check if there's only one year remaining
    if (activeName && !activeYear && filteredYearsOrdered.length === 1 && filteredNamesWithoutYear.length === 0) {
        shouldShowFilterOptions = false
    }
    // When a year is selected, check if there's only one name remaining
    if (activeYear && !activeName && filteredNamesByYear[activeYear] && filteredNamesByYear[activeYear].length === 1) {
        shouldShowFilterOptions = false
    }

    return (
        <div className="flex flex-col gap-3 py-2">

            <div>
                <div className="flex items-center mb-1">
                    <span className="text-neutral-800">
                        <strong className="text-neutral-900 text-lg">Omtrentleg tidslinje</strong>
                    </span>
                    <InfoPopover>
                        Tidslinja viser tidlegaste år Språksamlingane har henta ut for kvar kjeldeform. Den kan innehalde feil,
                        og er berre meint som eit verktøy for å filtrere kjeldene.
                    </InfoPopover>
                </div>
                {/* Active filter display */}
                {hasActiveFilter && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg mb-3">
                        <strong className="text-neutral-900 text-base">
                            {activeYear ? `År: ${activeYear}` : activeName ? `Namneform: ${activeName}` : ''}
                        </strong>
                        <ClickableIcon
                            label="Fjern kjeldeavgrensing"
                            replace
                            remove={['activeYear', 'activeName']}
                            className="ml-auto text-accent-800 hover:text-accent-900 underline underline-offset-2 font-medium transition-colors"
                        >
                            <PiX className="text-neutral-800" />
                        </ClickableIcon>
                    </div>
                )}

                {/* Vertical Timeline */}
                {shouldShowFilterOptions && visibleYearItems.length > 0 && !activeYear && (
                    <ul className="relative !mx-2 !px-0 p-2" role="list">
                        {visibleYearItems.map((item, index) => {
                            const isYearSelected = activeYear === item.year
                            const isLast = index === visibleYearItems.length - 1
                            const isFirst = index === 0
                            const showCollapseIndicator = isCollapsed && isFirst && visibleYearItems.length > 1

                            return (
                                <Fragment key={item.year}>
                                    <li className="flex items-center !pb-4 !pt-0 relative">
                                        {/* Timeline line segment */}
                                        <div
                                            className={`bg-primary-300 absolute w-1 left-0 ${showCollapseIndicator && isFirst
                                                ? 'top-1 bottom-0'
                                                : showCollapseIndicator && isLast
                                                    ? 'top-0 h-2'
                                                    : isLast
                                                        ? 'top-1 h-2'
                                                        : 'top-1 h-full'
                                                } ${index === 0 ? 'mt-2' : ''}`}
                                            aria-hidden="true"
                                        />

                                        {/* Timeline marker dot */}
                                        <div
                                            className={`w-4 h-4 rounded-full absolute -left-1.5 top-2 transition-colors ${isYearSelected
                                                ? 'bg-accent-800'
                                                : 'bg-primary-500'
                                                }`}
                                            aria-hidden="true"
                                        />

                                        {/* Year and name variants on same line */}
                                        <div className="ml-6 flex items-center gap-2 flex-wrap">
                                            {/* Year button */}
                                            <Clickable
                                                replace
                                                add={isYearSelected ? undefined : { activeYear: item.year }}
                                                remove={isYearSelected ? ['activeYear'] : ['activeName']}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isYearSelected
                                                    ? 'bg-accent-800 text-white'
                                                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {item.year}
                                            </Clickable>

                                            {/* Name variants for this year - on same line */}
                                            {item.names.length > 0 && !activeName && (
                                                <>
                                                    {item.names.map((nameKey) => {
                                                        const isNameSelected = activeName === nameKey

                                                        return (
                                                            <Clickable
                                                                key={nameKey}
                                                                replace
                                                                add={isNameSelected ? undefined : { activeName: nameKey }}
                                                                remove={isNameSelected ? ['activeName'] : ['activeYear']}
                                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isNameSelected
                                                                    ? 'bg-accent-800 text-white'
                                                                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                                    }`}
                                                            >
                                                                {nameKey}
                                                            </Clickable>
                                                        )
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                    {/* Collapse indicator in the middle - transit app style */}
                                    {showCollapseIndicator && (
                                        <li className="flex items-center !pb-4 !pt-0 relative" key={`${item.year}-collapse-indicator`}>
                                            {/* Dashed timeline line segment - extends into padding to connect seamlessly */}
                                            <div
                                                className="absolute left-0 -top-4 -bottom-4 w-1 [background:repeating-linear-gradient(to_bottom,theme(colors.primary.300)_0px,theme(colors.primary.300)_4px,transparent_4px,transparent_8px)] [background-size:4px_8px]"
                                                aria-hidden="true"
                                            />

                                            {/* Collapse button */}
                                            <div className="ml-6 flex items-center">
                                                <button
                                                    type="button"
                                                    className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                                    onClick={() => setShowAll(true)}
                                                    aria-expanded={false}
                                                >
                                                    Vis fleire ( + {hiddenYearItemsCount} )
                                                </button>
                                            </div>
                                        </li>
                                    )}
                                </Fragment>
                            )
                        })}
                        {/* Show fewer button at end when expanded */}
                        {hasMore && !hasActiveFilter && showAll && (
                            <li className="flex items-center !pt-2" key="show-fewer">
                                <div className="ml-6 flex items-center">
                                    <button
                                        type="button"
                                        className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                        onClick={() => setShowAll(false)}
                                        aria-expanded={true}
                                    >
                                        Vis færre
                                    </button>
                                </div>
                            </li>
                        )}
                    </ul>
                )}

                {/* Names for selected year (when year is active, show names without timeline) */}
                {shouldShowFilterOptions && activeYear && !activeName && filteredNamesByYear[activeYear] && filteredNamesByYear[activeYear].length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {filteredNamesByYear[activeYear].map((nameKey) => {
                            return (
                                <Clickable
                                    key={nameKey}
                                    replace
                                    add={{ activeName: nameKey }}
                                    remove={['activeYear']}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                                >
                                    {nameKey}
                                </Clickable>
                            )
                        })}
                    </div>
                )}

                {/* Names without year */}
                {shouldShowFilterOptions && visibleItems.filter(item => item.type === 'noYear').length > 0 && !activeName && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="text-sm font-medium text-neutral-700 mb-2">Namneformer utan år</div>
                        <div className="flex flex-wrap gap-2">
                            {visibleItems
                                .filter(item => item.type === 'noYear')
                                .map((item) => {
                                    const isNameSelected = activeName === item.name

                                    return (
                                        <Clickable
                                            key={item.name}
                                            replace
                                            add={isNameSelected ? undefined : { activeName: item.name }}
                                            remove={isNameSelected ? ['activeName'] : ['activeYear']}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isNameSelected
                                                ? 'bg-accent-800 text-white'
                                                : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                }`}
                                        >
                                            <span>{item.name}</span>
                                            <span className="text-sm opacity-75 ml-1">({item.count})</span>
                                        </Clickable>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

