import { DocContext } from "@/app/doc-provider"
import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import IconButton from "@/components/ui/icon-button"
import { datasetTitles } from "@/config/metadata-config"
import { base64UrlToString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext, useState, useEffect, useCallback } from "react"
import { PiBookOpen, PiBookOpenFill, PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold, PiClock, PiTextAa } from "react-icons/pi"
import * as h3 from 'h3-js';
import SourceItem from "@/components/children/source-item"

type FilterMode = 'both' | 'h3' | 'gnidu'

export default function FuzzyExplorer() {

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const searchParams = useSearchParams()
    const fuzzyNav = searchParams.get('fuzzyNav') || 'timeline'
    const parent = searchParams.get('parent')
    const doc = searchParams.get('doc')
    
    const [filterMode, setFilterMode] = useState<FilterMode>('both')
    const { sosiVocab } = useContext(GlobalContext)
    
    const { parentData } = useContext(DocContext)

    const [fuzzyResult, setFuzzyResult] = useState<any[] | null>(null)
    const [fuzzyResultLoading, setFuzzyResultLoading] = useState<boolean>(false)
    const [fuzzyResultError, setFuzzyResultError] = useState<any | null>(null)
    const [groups, setGroups] = useState<any[]>([])

    const { groupData } = useContext(GroupContext)
    const group = searchParams.get('group')


    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    const processResults = useCallback((results: any[]) => {
        const groupMap = new Map()
        
        results.forEach(result => {
            const highlight = result.highlight || {}
            const source = result._source
            
            const allNames = Array.from(new Set(
                (source.attestations?.map((att: any) => att.label) || [])
                    .concat(highlight['label'] || [])
                    .concat(highlight['altLabels'] || [])
            ))
            
            allNames.forEach((name) => {
                const nameStr = name as string
                let groupKey
                
                if (fuzzyNav === 'timeline') {

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
        
        if (fuzzyNav === 'timeline') {
            return groups.sort((a, b) => {
                if (a.year === null && b.year === null) return 0
                if (a.year === null) return 1
                if (b.year === null) return -1
                return parseInt(a.year) - parseInt(b.year)
            })
        } else {
            return groups
        }
    }, [fuzzyNav])

    useEffect(() => {
        
        if (group && groupData) {
            setFuzzyResultLoading(true)
            const requestBody: any = {}
            const decodedGroup: string = base64UrlToString(group)
            const firstUnderscore = decodedGroup.indexOf('_')
            const secondUnderscore = decodedGroup.indexOf('_', firstUnderscore + 1)
            const groupType = decodedGroup.substring(0, firstUnderscore)
            const groupValue = decodedGroup.substring(firstUnderscore + 1, secondUnderscore)

            const seenNames = new Set<string>()
            const allNames: string[] = []
            const allGnidu: Set<string> = new Set()
            const allSnid: Set<string> = new Set()
            
            

            const processName = (name: string) => {
                name = name.trim().replace("-", " ")
                if (name.includes(' ')) {
                    name =  name.replace(/(?:^|[\s,])(vestre|nordre|[søndre|østre|austre|mellem|mellom|[Yy]tt?re)(?=\s|$)/giu, '').trim()
                    // Remove repeating caps
                    name = name.replace(/([A-Z])\1+/gu, '$1')
                }

                return name
            }

            groupData.forEach((item: any) => {
                const fields = item.fields;
                if (fields?.gnidu) {
                    fields.gnidu.forEach((gnidu: string) => {
                        allGnidu.add(gnidu)
                    })
                }

                if (fields?.snid) {
                    allSnid.add(fields.snid)
                }

                ['label', 'altLabels', 'attestations.label'].forEach((field: string) => {
                    if (fields?.[field]) {
                        fields[field].forEach((label: string) => {
                            if (!seenNames.has(label)) {
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
                console.log("Search terms", requestBody.searchTerms);
            } else {
                console.log("No search terms found");
                return;
            }

            

            if (groupType === 'h3') {
                const neighbours = h3.gridDisk(groupValue, 1)
                requestBody.h3 = neighbours
            }


            if (allSnid.size > 0) {
                requestBody.snid = Array.from(allSnid)
            }
            
            if (allGnidu.size > 0) {
                requestBody.gnidu = Array.from(allGnidu)
            }


            fetch('/api/search/fuzzy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }).then(res => res.json()).then(data => {
                setFuzzyResult(data.hits.hits)
            }).catch(err => {
                setFuzzyResultError(err)
            }).finally(() => {
                setFuzzyResultLoading(false)
            })
        }
        
    }, [groupData, setFuzzyResultError, processResults, filterMode])


    useEffect(() => {
        if (fuzzyResult) {
            setGroups(processResults(fuzzyResult))
        }
    }, [fuzzyResult, processResults])




    const groupName = group && base64UrlToString(group).split('_').slice(2).join('_')
    

    return <div className={`${fuzzyResultLoading ? 'opacity-50' : ''}`}>        
        <p><strong>{groupName}</strong> | Liknande namn i nærområdet</p>
       
        <ul className={`${fuzzyNav === 'timeline' ? 'relative p-2' : 'flex flex-col divide-y divide-neutral-200'} w-full`}>
            {groups.map((group, index) => {
                const groupId = `${fuzzyNav}-${group.key}`
                const groupsWithYears = groups.filter(g => g.year)
                const indexInYearGroups = groupsWithYears.findIndex(g => g.key === group.key)
                const isLastYearGroup = indexInYearGroups === groupsWithYears.length - 1
                
                return (
                    <li key={groupId} className={fuzzyNav === 'timeline' ? 'flex items-center !pb-4 !pt-0 relative w-full' : 'flex flex-col gap-2 py-2 w-full'}>
                        {fuzzyNav === 'timeline' && group.year && (
                            <>
                                <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLastYearGroup ? 'h-4' : 'h-full'} ${indexInYearGroups === 0 ? 'mt-2' : ''}`}></div>
                                <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
                            </>
                        )}
                        
                        <div className={fuzzyNav === 'timeline' ? (group.year ? 'ml-6 flex flex-col w-full' : 'flex flex-col w-full') : 'flex flex-col gap-2 w-full'}>
                            {fuzzyNav === 'timeline' && (
                                <span className="mr-2 my-1 mt-1 font-medium text-neutral-600">
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
                                            <div
                                                onClick={() => toggleGroupExpansion(nameId)}
                                                className="text-left flex items-center gap-2 py-1 cursor-pointer hover:text-neutral-700 transition-colors"
                                            >
                                                <div className="flex-shrink-0">
                                                    {isNameExpanded ? <PiCaretUpBold className="text-sm" aria-hidden="true"/> : <PiCaretDownBold className="text-sm" aria-hidden="true"/>}
                                                </div>
                                                <span className="font-medium">{name}</span>
                                                <span className="text-xs text-neutral-500">({nameResults.length})</span>
                                            </div>
                                            
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
                                                                <span className="font-medium text-sm text-neutral-600 uppercase tracking-wider">
                                                                    {datasetTitles[dataset]}
                                                                </span>
                                                                <ul className="flex flex-col mt-1 divide-y divide-neutral-200 w-full">
                                                                    {(items as any[]).map((resultItem: any, resultIndex: number) => {
                                                                        const doc = resultItem.doc
                                                                        const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                                        
                                                                        return (
                                                                            <li key={uniqueKey} className="flex w-full">
                                                                                <SourceItem hit={doc} isMobile={false}/>
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
    </div>
}

