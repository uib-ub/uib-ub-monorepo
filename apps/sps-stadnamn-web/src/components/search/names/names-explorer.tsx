import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { base64UrlToString, getSkeletonLength } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext, useState, useCallback, useEffect } from "react"
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi"
import * as h3 from 'h3-js';
import SourceItem from "@/components/children/source-item"
import useGroupData from "@/state/hooks/group-data"
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function NamesExplorer() {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav') || 'timeline'
    const { isMobile } = useContext(GlobalContext)
    const namesScope = searchParams.get('namesScope') || 'group'
    const queryClient = useQueryClient()
    
    // Debug log for namesScope changes
    useEffect(() => {
        console.log('namesScope changed to:', namesScope)
        // Manually invalidate the query when namesScope changes
        queryClient.invalidateQueries({ queryKey: ['namesData'] })
    }, [namesScope, queryClient])

    const { groupData } = useGroupData()
    const group = searchParams.get('group')
    
    // Debug log for groupData
    useEffect(() => {
        console.log('groupData changed:', groupData ? `${groupData.length} items` : 'null')
    }, [groupData])

    const { data: namesResult, error: namesResultError, isLoading: namesResultLoading } = useQuery({
        queryKey: ['namesData', group, namesScope, groupData],
        queryFn: async () => {
            console.log('Starting queryFn execution with scope:', namesScope)
            console.log('Group param:', group)
            console.log('Group data available:', !!groupData, groupData ? groupData.length : 0)
            console.log("GROUP DATA:", groupData)
            
            if (!group || !groupData || groupData.length === 0) {
                console.log('Early return: missing group or groupData')
                return null
            }
            
            const decodedGroup: string = base64UrlToString(group)
            console.log('Decoded group:', decodedGroup)
            const firstUnderscore = decodedGroup.indexOf('_')
            const secondUnderscore = decodedGroup.indexOf('_', firstUnderscore + 1)
            const groupType = decodedGroup.substring(0, firstUnderscore)
            const groupValue = decodedGroup.substring(firstUnderscore + 1, secondUnderscore)
            console.log('Group type:', groupType, 'Group value:', groupValue)

            // If namesScope is 'group', return group data directly without fuzzy search
            if (namesScope === 'group') {
                console.log('Returning direct group data without fuzzy search')
                return groupData;
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

            // Process group data to extract search terms
            console.log('Processing group data to extract search terms')
            groupData.forEach((item: any) => {
                // Get the source data directly from _source
                const source = item._source;
                
                // Debug log to see the structure
                console.log('Item structure:', {
                    hasSource: !!source,
                    gnidu: source?.gnidu ? (Array.isArray(source.gnidu) ? 'array' : typeof source.gnidu) : 'missing'
                });

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
                const neighbours = h3.gridDisk(groupValue, 1)
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

            console.log('About to send fuzzy search request with payload:', JSON.stringify(requestBody))
            try {
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
            } catch (error) {
                console.error('Error during fuzzy search fetch:', error)
                throw error
            }
        },
        enabled: !!groupData && groupData.length > 0,
        // Add a refetch interval to ensure the query re-runs when scope changes
        staleTime: 0,
        // Force refetch when params change
        refetchOnMount: true,
        refetchOnWindowFocus: false
    })
    
    // Debug log for query results
    useEffect(() => {
        console.log('Query state:', {
            loading: namesResultLoading,
            error: namesResultError ? namesResultError.message : null,
            resultCount: namesResult ? namesResult.length : 0
        })
    }, [namesResult, namesResultError, namesResultLoading])

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    const processResults = useCallback((results: any[]) => {
        console.log('Processing results:', results.length)
        const groupMap = new Map()
        
        if (!results) return []
        
        results.forEach(result => {
            const highlight = result.highlight || {}
            const source = result._source || result.fields || {}
            
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
        })
        
        const groups = Array.from(groupMap.values())
        
        if (namesNav === 'timeline') {
            return groups.sort((a, b) => {
                if (a.year === null && b.year === null) return 0
                if (a.year === null) return 1
                if (b.year === null) return -1
                return parseInt(a.year) - parseInt(b.year)
            })
        } else {
            return groups
        }
    }, [namesNav])

    // Process results directly from the React Query result
    const groups = namesResult ? processResults(namesResult) : []

    const groupName = group && base64UrlToString(group).split('_').slice(2).join('_')
    
    return <>        
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <div className="flex border border-neutral-200 rounded-lg p-1 tabs text-tabs">
                    <Clickable
                        add={{ namesNav: 'timeline' }}
                        aria-pressed={namesNav === 'timeline'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline`}
                    >
                        Tidslinje
                    </Clickable>
                    <Clickable
                        add={{ namesNav: 'list' }}
                        aria-pressed={namesNav === 'list'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline`}
                    >
                        Liste
                    </Clickable>
                </div>
                <div className="flex border border-neutral-200 rounded-lg p-1 tabs text-tabs">
                    <Clickable
                        add={{ namesScope: 'group' }}
                        aria-pressed={namesScope === 'group'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline`}
                    >
                        Gruppe
                    </Clickable>
                    <Clickable
                        add={{ namesScope: 'extended' }}
                        aria-pressed={namesScope === 'extended'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline`}
                    >
                        Utvida søk
                    </Clickable>
                </div>
            </div>
            <h3 className="text-lg font-serif">{groupName}</h3>
        </div>

        {namesResult && namesResult.length === 0 && !namesResultLoading ? (
            <p className="text-neutral-800">Fann ingen liknande namn i nærleiken</p>
        ) : !namesResult || namesResultLoading ? (
            // Loading skeleton - only show when loading or no results exist yet
            <ul className={`${namesNav === 'timeline' ? 'relative p-2' : 'flex flex-col divide-y divide-neutral-200'} w-full`}>
                {Array.from({length: 3}).map((_, index) => (
                    <li key={`skeleton-${index}`} className={namesNav === 'timeline' ? 'flex items-center !pb-4 !pt-0 relative w-full' : 'flex flex-col gap-2 py-2 w-full'}>
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
        ) : (
            <ul className={`${namesNav === 'timeline' ? 'relative p-2' : 'flex flex-col divide-y divide-neutral-200'} w-full`}>
                {groups.map((group, index) => {
                    const groupId = `${namesNav}-${group.key}`
                    const groupsWithYears = groups.filter(g => g.year)
                    const indexInYearGroups = groupsWithYears.findIndex(g => g.key === group.key)
                    const isLastYearGroup = indexInYearGroups === groupsWithYears.length - 1
                    
                    return (
                        <li key={groupId} className={namesNav === 'timeline' ? 'flex items-center !pb-4 !pt-0 relative w-full' : 'flex flex-col gap-2 py-2 w-full'}>
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
                                
                                <ul className="flex flex-col gap-1">
                                    {(Array.from(new Set(group.results.map((r: any) => r.highlightedName))) as string[]).map(name => {
                                        const nameResults = group.results.filter((r: any) => r.highlightedName === name)
                                        const nameId = `${groupId}-${name}`
                                        const isNameExpanded = expandedGroups[nameId] ?? false
                                        
                                        return (
                                            <li key={name} className="flex flex-col w-full">
                                                <button
                                                    onClick={() => toggleGroupExpansion(nameId)}
                                                    className="text-left flex items-center gap-2 py-1 cursor-pointer hover:text-neutral-700 transition-colors"
                                                >
                                                    <div className="flex-shrink-0">
                                                        {isNameExpanded ? <PiCaretUpBold className="text-sm" aria-hidden="true"/> : <PiCaretDownBold className="text-sm" aria-hidden="true"/>}
                                                    </div>
                                                    <span className="font-medium">{name}</span>
                                                    <span className="text-sm text-neutral-700">({nameResults.length})</span>
                                                </button>
                                                
                                                {isNameExpanded && (
                                                    <div className="flex flex-col ml-5 mt-1 w-full">
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
                                                                <div key={dataset} className="mb-3 last:mb-0">
                                                                    <span className="font-medium text-sm text-neutral-700 uppercase tracking-wider">
                                                                        {datasetTitles[dataset]}
                                                                    </span>
                                                                    <ul className="flex flex-col mt-1 divide-y divide-neutral-200 w-full">
                                                                        {(items as any[]).map((resultItem: any, resultIndex: number) => {
                                                                            const doc = resultItem.doc
                                                                            const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                                            
                                                                            return (
                                                                                <li key={uniqueKey} className="flex w-full">
                                                                                    <SourceItem hit={doc} isMobile={isMobile}/>
                                                                                </li>
                                                                            )
                                                                        })}
                                                                    </ul>
                                                                </div>
                                                            ))
                                                        })()}
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </li>
                    )
                })}
            </ul>
        )}
    </>
}

