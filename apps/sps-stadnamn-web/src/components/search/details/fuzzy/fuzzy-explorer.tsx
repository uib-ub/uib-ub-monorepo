import { DocContext } from "@/app/doc-provider"
import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import IconButton from "@/components/ui/icon-button"
import { datasetTitles } from "@/config/metadata-config"
import { base64UrlToString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold, PiClock, PiTextAa } from "react-icons/pi"
import * as h3 from 'h3-js';

type ViewMode = 'timeline' | 'names'

export default function FuzzyExplorer() {

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [viewMode, setViewMode] = useState<ViewMode>('timeline')
    const { sosiVocab } = useContext(GlobalContext)

    const { docData } = useContext(DocContext)

    const [fuzzyResult, setFuzzyResult] = useState<any[] | null>(null)
    const [fuzzyResultLoading, setFuzzyResultLoading] = useState<boolean>(false)
    const [setFuzzyResultError] = useState<any | null>(null)

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }


    const processResults = (results: any[]) => {
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
                
                if (viewMode === 'timeline') {

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
        
        if (viewMode === 'timeline') {
            return groups.sort((a, b) => {
                if (a.year === null && b.year === null) return 0
                if (a.year === null) return 1
                if (b.year === null) return -1
                return parseInt(a.year) - parseInt(b.year)
            })
        } else {
            return groups
        }
    }

    useEffect(() => {
        if (docData) {
            setFuzzyResultLoading(true)
            const requestBody: any = {}

            const processName = (name: string) => {
                name =  name.replace(/(?:^|[\s,])(vestre|nordre|[søndre|østre|mellem|mellom|[Yyt])(?=\s|$)/gi, '').trim()
                // Remove special characters
                name = name.replace(/[^\w\s]/g, '').trim()
                

                // Remove repeating caps
                name = name.replace(/([A-Z])\1+/g, '$1')

                // Remove singleton letters
                name = name.replace(/\b\w\b/g, '').trim()

                return name
            }

            // Use Set for automatic deduplication
            const searchTermsSet = new Set<string>()
            
            if (docData._source.label) {
                const processed = processName(docData._source.label)
                if (processed.length > 0) {
                    searchTermsSet.add(processed)
                } else {
                    searchTermsSet.add(docData._source.label)
                }
            }

            if (docData._source.altLabels) {
                docData._source.altLabels.forEach((label: string) => {
                    const processed = processName(label)
                    if (processed.length > 0) {
                        searchTermsSet.add(processed) 
                    } else {
                        searchTermsSet.add(label)
                    }
                })
            }

            if (docData._source.attestations) {
                docData._source.attestations.forEach((attestation: any) => {
                    const processed = processName(attestation.label)
                    if (processed.length > 0) {
                        searchTermsSet.add(processed) 
                    } else {
                        searchTermsSet.add(attestation.label)
                    }
                })
            }

            // Convert Set to array for the API
            if (searchTermsSet.size > 0) {
                requestBody.searchTerms = Array.from(searchTermsSet)
                console.log("Search terms", requestBody.searchTerms)
            } else {
                console.log("No search terms found")
                return
            }

            if (docData._source.h3) {
                const neighbours = h3.gridDisk(docData._source.h3, 1)
                requestBody.h3 = neighbours
            }

            if (docData._source.snid) {
                requestBody.snid = docData._source.snid
            }
            
            if (docData._source.gnidu) {
                if (Array.isArray(docData._source.gnidu)) {
                    requestBody.gnidu = docData._source.gnidu
                } else {
                    requestBody.gnidu = [docData._source.gnidu]
                }
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
        
    }, [docData, setFuzzyResultError])

    const groups = fuzzyResult ? processResults(fuzzyResult) : []

    return <div className={`${fuzzyResultLoading ? 'opacity-50' : ''}`}>
        <h2 className="text-lg font-medium text-neutral-900 mb-2">Finn andre namneformer</h2>
        <div className="mb-4 flex items-center gap-2">
            <div className="flex bg-neutral-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'timeline' 
                            ? 'bg-white text-neutral-900 shadow-sm' 
                            : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                >
                    <PiClock className="text-base" />
                    Tidslinje
                </button>
                <button
                    onClick={() => setViewMode('names')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'names' 
                            ? 'bg-white text-neutral-900 shadow-sm' 
                            : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                >
                    <PiTextAa className="text-base" />
                    Navn
                </button>
            </div>
        </div>

        <ul className={`${viewMode === 'timeline' ? 'relative p-2' : 'flex flex-col divide-y divide-neutral-200'} w-full`}>
            {groups.map((group, index) => {
                const groupId = `${viewMode}-${group.key}`
                const groupsWithYears = groups.filter(g => g.year)
                const indexInYearGroups = groupsWithYears.findIndex(g => g.key === group.key)
                const isLastYearGroup = indexInYearGroups === groupsWithYears.length - 1
                
                return (
                    <li key={groupId} className={viewMode === 'timeline' ? 'flex items-center !pb-4 !pt-0 relative w-full' : 'flex flex-col gap-2 py-2 w-full'}>
                        {viewMode === 'timeline' && group.year && (
                            <>
                                <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLastYearGroup ? 'h-4' : 'h-full'} ${indexInYearGroups === 0 ? 'mt-2' : ''}`}></div>
                                <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
                            </>
                        )}
                        
                        <div className={viewMode === 'timeline' ? (group.year ? 'ml-6 flex flex-col w-full' : 'flex flex-col w-full') : 'flex flex-col gap-2 w-full'}>
                            {viewMode === 'timeline' && (
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
                                                <ul className="flex flex-col ml-5 mt-1 divide-y divide-neutral-200 w-full">
                                                    {nameResults.map((resultItem: any, resultIndex: number) => {
                                                        const doc = resultItem.doc
                                                        const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                        
                                                        return (
                                                            <li key={uniqueKey} className="flex w-full">
                                                                <Clickable 
                                                                    link={viewMode === 'timeline'} 
                                                                    className="flex flex-col w-full gap-1.5 py-2 items-start hover:bg-neutral-50 rounded-md px-3 -mx-3 transition-colors no-underline" 
                                                                    remove={viewMode === 'timeline' ? ["group"] : undefined}
                                                                    add={{details: "doc", doc: doc._source?.uuid, docDataset: doc._index.split('-')[2]}}
                                                                >
                                                                    <span className="font-medium text-sm text-neutral-600 uppercase tracking-wider">{datasetTitles[doc._index.split('-')[2]]}</span>

                                                                    {doc._source?.sosi && (
                                                                        <div className="flex items-center gap-2 text-neutral-900">
                                                                            <span className="font-medium">
                                                                                {viewMode === 'timeline' ? (
                                                                                    <><strong>{doc._source.label}</strong> ({sosiVocab[doc._source.sosi]?.label})</>
                                                                                ) : (
                                                                                    sosiVocab[doc._source.sosi]?.label || doc._source.label
                                                                                )}
                                                                            </span>
                                                                            {doc._source?.description && (
                                                                                <span className="text-neutral-600">• {doc._source.description}</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Clickable>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
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

