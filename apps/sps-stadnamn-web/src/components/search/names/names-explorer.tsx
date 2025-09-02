import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { getSkeletonLength } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useState, useCallback, useEffect } from "react"
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi"
import * as h3 from 'h3-js';
import SourceItem from "@/components/children/source-item"
import useGroupData from "@/state/hooks/group-data"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base64UrlToString } from "@/lib/param-utils"
import { useGroup } from "@/lib/param-hooks"


const overviewQuery = async (groupCode: string | null, namesScope: string, groupData: any[], groupValue: string | null, groupDoc: any) => {
            
        if (!groupValue || !groupData || groupData.length === 0) {
            console.log('Early return: missing group or groupData')
            return null
        }


        
        console.log('Decoded group:', groupValue)
        const firstUnderscore = groupValue.indexOf('_')
        const secondUnderscore = groupValue.indexOf('_', firstUnderscore + 1)
        const groupType = groupValue.substring(0, firstUnderscore)
        const groupLocation = groupValue.substring(firstUnderscore + 1, secondUnderscore)
        console.log('Group type:', groupType, 'Group value:', groupLocation)


        if (namesScope === 'group') {
            const res = await fetch(`/api/group?group=${groupCode}&size=1000`)
            const data = await res.json()
            return data.hits.hits
        }

        
        // Otherwise, for 'extended' scope, perform fuzzy search
        console.log('Preparing fuzzy search for extended scope')
        const requestBody: any = {}
        const seenNames = new Set<string>()
        const allNames: string[] = []
        const allGnidu: Set<string> = new Set()
        const allSnid: Set<string> = new Set()
        
        const processName = (name: string) => {
            name = name.trim().replace("-", " ")
            if (name.includes(' ')) {
                name = name.replace(/(?:^|[\s,])(vestre|nordre|[søndre|østre|austre|mellem|mellom|[Yy]tt?re)(?=\s|$)/giu, '').trim()
                // Remove repeating caps
                name = name.replace(/([A-Z])\1+/gu, '$1')
            }
            return name
        }

        const source = groupDoc._source


        // Handle gnidu - make sure we handle it correctly whether it's an array or not
        if (source?.gnidu) {
            const gnidus = Array.isArray(source.gnidu) ? source.gnidu : [source.gnidu];
            gnidus.forEach((gnidu: string) => {
                allGnidu.add(gnidu);
            });
        }

        // Handle snid - single value field
        if (source?.snid) {
            allSnid.add(source.snid);
        }

        // Process label and altLabels
        ['label', 'altLabels'].forEach((field: string) => {
            if (source && source[field]) {
                const labels = Array.isArray(source[field]) ? source[field] : [source[field]];
                labels.forEach((label: string) => {
                    if (label && !seenNames.has(label)) {
                        seenNames.add(label);
                        allNames.push(processName(label));
                    }
                });
            }
        });


        // Use the processed names
        if (allNames.length > 0) {
            requestBody.searchTerms = [...new Set(allNames.filter(Boolean))];
            console.log(`Found ${requestBody.searchTerms.length} search terms:`, requestBody.searchTerms)
        } else {
            console.log("No search terms found");
            return [];
        }

        if (groupType === 'h3') {
            const neighbours = h3.gridDisk(groupLocation, 1)
            requestBody.h3 = neighbours
            console.log(`Added ${neighbours.length} H3 neighbors to request`)
        }

        if (allSnid.size > 0) {
            requestBody.snid = Array.from(allSnid)
            console.log(`Added ${requestBody.snid.length} SNIDs to request`)
        }
        
        if (allGnidu.size > 0) {
            requestBody.gnidu = Array.from(allGnidu)
            console.log(`Added ${requestBody.gnidu.length} GNIDUs to request`)
        }


        const res = await fetch('/api/search/fuzzy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        
        console.log('Fuzzy search response status:', res.status)
        
        if (!res.ok) {
            const errorText = await res.text()
            console.error('Fuzzy search failed:', errorText)
            throw new Error(`Failed to fetch fuzzy search results: ${res.status} ${errorText}`)
        }
        
        const data = await res.json()
        console.log(`Received ${data.hits.hits.length} results from fuzzy search`)
        return data.hits.hits

    }







export default function NamesExplorer() {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav') || 'timeline'
    const { isMobile } = useContext(GlobalContext)
    const namesScope = searchParams.get('namesScope') || 'group'


    const { groupData, groupDoc } = useGroupData()
    const { groupCode, groupValue} = useGroup()
    const router = useRouter()
    

    const { data: groups, error: namesResultError, isLoading: namesResultLoading } = useQuery({
        queryKey: ['namesData', groupCode, namesScope],
        queryFn: () => overviewQuery(groupCode, namesScope, groupData, groupValue, groupDoc),
        enabled: !!groupData && groupData.length > 0,
        select: (data) => {
            console.log("DATA:", data)
            if (!data) return []
            
            console.log('Processing results:', data.length)
            const groupMap = new Map()
            
            
            data.forEach((result: any) => {
                const source = result._source || result.fields || {}
                
                if (namesNav === 'datasets') {
                    // For datasets view, don't group by dataset here - let the render section handle it
                    const groupKey = 'all-datasets'
                    
                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, { key: groupKey, results: [] })
                    }
                    
                    groupMap.get(groupKey).results.push({
                        doc: result,
                        highlightedName: source.label || source.altLabels?.[0] || 'Unknown'
                    })
                } else {
                    // For timeline and list views, keep existing name-based grouping
                    const allNames = Array.from(new Set(
                        (source.attestations?.map((att: any) => att.label) || [])
                            .concat(source.label ? [source.label] : [])
                            .concat(source.altLabels || [])
                    ))
                    
                    allNames.forEach((name) => {
                        const nameStr = name as string
                        let groupKey
                        
                        if (namesNav === 'timeline') {
                            const year = source.attestations?.find((att: any) => att.label === nameStr)?.year || source.year || null
                            groupKey = year || 'no-year'
                            
                            if (!groupMap.has(groupKey)) {
                                groupMap.set(groupKey, { key: groupKey, year, results: [] })
                            }
                        } else {
                            groupKey = nameStr
                            if (!groupMap.has(groupKey)) {
                                groupMap.set(groupKey, { key: groupKey, results: [] })
                            }
                        }
                        
                        groupMap.get(groupKey).results.push({
                            doc: result,
                            highlightedName: nameStr,
                        })
                    })
                }
            })
            
            const processedGroups = Array.from(groupMap.values())
            
            if (namesNav === 'timeline') {
                return processedGroups.sort((a, b) => {
                    if (a.year === null && b.year === null) return 0
                    if (a.year === null) return 1
                    if (b.year === null) return -1
                    return parseInt(a.year) - parseInt(b.year)
                })
            } else {
                return processedGroups
            }
        },
    })

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    return <>        
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {/* Tabs - completely untouched */}
                <div className="flex border border-neutral-200 rounded-lg p-1 tabs text-tabs">
                    <Clickable
                        add={{ namesNav: 'datasets' }}
                        aria-pressed={namesNav === 'datasets'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${namesNav === 'datasets' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Datasett
                    </Clickable>
                    <Clickable
                        add={{ namesNav: 'timeline' }}
                        aria-pressed={namesNav === 'timeline'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${namesNav === 'timeline' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Tidslinje
                    </Clickable>
                    <Clickable
                        add={{ namesNav: 'list' }}
                        aria-pressed={namesNav === 'list'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${namesNav === 'list' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Namn
                    </Clickable>
                </div>
                
                {/* Scope Toggle - only minor spacing improvements */}
                <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={namesScope === 'extended'}
                            onChange={(e) => {
                                const newParams = new URLSearchParams(searchParams)
                                newParams.set('namesScope', e.target.checked ? 'extended' : 'group')
                                router.replace(`?${newParams.toString()}`)
                            }}
                            className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded"
                        />
                        <span>
                            Inkluder fleire liknande oppslag
                        </span>
                    </label>
                </div>
            </div>

            {/* Content Section - improved uniformity */}
            {groups && groups.length === 0 && !namesResultLoading ? (
                <div className="p-4 text-center">
                    <p className="text-neutral-800">Fann ingen liknande namn i nærleiken</p>
                </div>
            ) : !groups || namesResultLoading ? (
                // Loading skeleton - preserve exact timeline styling
                <div className="px-4">
                    <ul className={`${namesNav === 'timeline' ? 'relative' : 'flex flex-col divide-y divide-neutral-200'}`}>
                        {Array.from({length: 3}).map((_, index) => (
                            <li key={`skeleton-${index}`} className={
                                namesNav === 'timeline' 
                                    ? 'flex items-center !pb-4 !pt-0 relative w-full' 
                                    : 'flex flex-col gap-2 py-1 w-full'
                            }>
                                {namesNav === 'timeline' && (
                                    <>
                                        <div className="bg-neutral-900/10 absolute w-1 left-0 top-1 h-full"></div>
                                        <div className="w-4 h-4 rounded-full bg-neutral-900/10 absolute -left-1.5 top-2"></div>
                                    </>
                                )}
                                
                                <div className={namesNav === 'timeline' ? 'ml-6 flex flex-col w-full' : 'flex flex-col gap-2 w-full'}>
                                    {namesNav === 'timeline' && (
                                        <div className="h-5 bg-neutral-900/10 rounded-full animate-pulse mr-2 my-1 mt-1" style={{width: `${getSkeletonLength(index, 3, 6)}rem`}}></div>
                                    )}
                                    
                                    <ul className="flex flex-col gap-1">
                                        {Array.from({length: 2}).map((_, nameIndex) => (
                                            <li key={`skeleton-name-${nameIndex}`} className="flex flex-col w-full">
                                                <div className="flex items-center gap-2 py-1">
                                                    <div className="w-3 h-3 bg-neutral-900/10 rounded-sm animate-pulse flex-shrink-0"></div>
                                                    <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{width: `${getSkeletonLength(index + nameIndex, 6, 12)}rem`}}></div>
                                                    <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse w-8"></div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                // Results content - preserve exact timeline styling, improve uniformity
                <div className="px-4">
                    <ul className={`${namesNav === 'timeline' ? 'relative' : 'flex flex-col divide-y divide-neutral-200'}`}>
                        {groups.map((group, index) => {
                            const groupId = `${namesNav}-${group.key}`
                            const groupsWithYears = groups.filter(g => g.year)
                            const indexInYearGroups = groupsWithYears.findIndex(g => g.key === group.key)
                            const isLastYearGroup = indexInYearGroups === groupsWithYears.length - 1
                            
                            return (
                                <li key={groupId} className={
                                    namesNav === 'timeline' 
                                        ? 'flex items-center !pb-4 !pt-0 relative w-full' 
                                        : 'flex flex-col gap-2 py-1 w-full'
                                }>
                                    {namesNav === 'timeline' && group.year && (
                                        <>
                                            <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLastYearGroup ? 'h-4' : 'h-full'} ${indexInYearGroups === 0 ? 'mt-2' : ''}`}></div>
                                            <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
                                        </>
                                    )}
                                    
                                    <div className={namesNav === 'timeline' ? (group.year ? 'ml-6 flex flex-col w-full' : 'flex flex-col w-full') : 'flex flex-col gap-2 w-full'}>
                                        {namesNav === 'timeline' && (
                                            <span className="mr-2 my-1 mt-1 font-medium text-neutral-700">
                                                {group.year || 'Utan årstal'}
                                            </span>
                                        )}
                                        {namesNav === 'datasets' && (datasetTitles[group.dataset] || group.dataset) && (
                                            <span className="mr-2 my-1 mt-1 font-medium text-neutral-700">
                                                {datasetTitles[group.dataset] || group.dataset}
                                            </span>
                                        )}
                                        
                                        <ul className="flex flex-col gap-1">
                                            {namesNav === 'datasets' ? (
                                                // For datasets view, show collapsible dataset groups
                                                <ul className="flex flex-col divide-y divide-neutral-200 w-full">
                                                    {(Array.from(new Set(group.results.map((r: any) => r.doc._index?.split('-')[2] || 'unknown'))) as string[]).map((dataset, index) => {
                                                        const datasetResults = group.results.filter((r: any) => r.doc._index?.split('-')[2] === dataset)
                                                        const datasetId = `${groupId}-${dataset}`
                                                        const isDatasetExpanded = expandedGroups[datasetId] ?? false
                                                        
                                                        return (
                                                            <li key={dataset} className="flex flex-col w-full py-1">
                                                                <button
                                                                    onClick={() => toggleGroupExpansion(datasetId)}
                                                                    className="text-left flex items-center gap-3 py-2 cursor-pointer hover:text-neutral-700 transition-colors"
                                                                >
                                                                    <div className="flex-shrink-0">
                                                                        {isDatasetExpanded ? <PiCaretUpBold className="text-sm" aria-hidden="true"/> : <PiCaretDownBold className="text-sm" aria-hidden="true"/>}
                                                                    </div>
                                                                    <span className="font-medium">{datasetTitles[dataset] || dataset}</span>
                                                                    <span className="text-sm text-neutral-700">({datasetResults.length})</span>
                                                                </button>
                                                                
                                                                {isDatasetExpanded && (
                                                                    
                                                                        <ul className="flex flex-col divide-y divide-neutral-200 w-full">
                                                                            {datasetResults.map((resultItem: any, resultIndex: number) => {
                                                                                const doc = resultItem.doc
                                                                                const uniqueKey = `${doc._id}-${resultIndex}`
                                                                                
                                                                                return (
                                                                                    <li key={uniqueKey} className="flex w-full py-1">
                                                                                        <SourceItem hit={doc} isMobile={isMobile}/>
                                                                                    </li>
                                                                                )
                                                                            })}
                                                                        </ul>
                                                                   
                                                                )}
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            ) : (
                                                // For timeline and list views, keep existing name-based grouping
                                                (Array.from(new Set(group.results.map((r: any) => r.highlightedName))) as string[]).map(name => {
                                                    const nameResults = group.results.filter((r: any) => r.highlightedName === name)
                                                    const nameId = `${groupId}-${name}`
                                                    const isNameExpanded = expandedGroups[nameId] ?? false
                                                    
                                                    return (
                                                        <li key={name} className="flex flex-col w-full">
                                                            <button
                                                                onClick={() => toggleGroupExpansion(nameId)}
                                                                className="text-left flex items-center gap-3 py-2 cursor-pointer hover:text-neutral-700 transition-colors"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    {isNameExpanded ? <PiCaretUpBold className="text-sm" aria-hidden="true"/> : <PiCaretDownBold className="text-sm" aria-hidden="true"/>}
                                                                </div>
                                                                <span className="font-medium">{name}</span>
                                                                <span className="text-sm text-neutral-700">({nameResults.length})</span>
                                                            </button>
                                                            
                                                            {isNameExpanded && (
                                                                <>
                                                                    {(() => {
                                                                        // Group results by dataset
                                                                        const datasetGroups = nameResults.reduce((acc: any, resultItem: any) => {
                                                                            const dataset = resultItem.doc._index.split('-')[2]
                                                                            if (!acc[dataset]) {
                                                                                acc[dataset] = []
                                                                            }
                                                                            acc[dataset].push(resultItem)
                                                                            return acc
                                                                        }, {})
                                                                        
                                                                        return Object.entries(datasetGroups).map(([dataset, items]: [string, any]) => (
                                                                            <div key={dataset} className="mb-4 last:mb-0">
                                                                                <span className="font-medium text-sm text-neutral-700 uppercase tracking-wider">
                                                                                    {datasetTitles[dataset]}
                                                                                </span>
                                                                                <ul className="flex flex-col divide-y divide-neutral-200 w-full">
                                                                                    {(items as any[]).map((resultItem: any, resultIndex: number) => {
                                                                                        const doc = resultItem.doc
                                                                                        const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                                                        
                                                                                        return (
                                                                                            <li key={uniqueKey} className="flex w-full py-1">
                                                                                                <SourceItem hit={doc} isMobile={isMobile}/>
                                                                                            </li>
                                                                                        )
                                                                                    })}
                                                                                </ul>
                                                                            </div>
                                                                        ))
                                                                    })()}
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                })
                                            )}
                                        </ul>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    </>
}

