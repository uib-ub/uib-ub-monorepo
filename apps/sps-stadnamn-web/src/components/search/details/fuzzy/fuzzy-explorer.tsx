import { DocContext } from "@/app/doc-provider"
import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import IconButton from "@/components/ui/icon-button"
import { datasetTitles } from "@/config/metadata-config"
import { base64UrlToString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { PiCaretDown, PiCaretUp, PiClock, PiTextAa } from "react-icons/pi"
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
            
            const allNames = (highlight.label || [])
                .concat(highlight.altLabels || [])
                .concat(highlight['attestations.label'] || [])
            
            allNames.forEach((name: string) => {
                let groupKey
                
                if (viewMode === 'timeline') {
                    const nameType = highlight.label?.includes(name) ? 'label' : 
                                    highlight.altLabels?.includes(name) ? 'altLabels' : 'attestations'
                    
                    let year = null
                    if (nameType === 'attestations') {
                        const attestation = source.attestations?.find((att: any) => att.label === name)
                        year = attestation?.year || null
                    } else {
                        year = source.year || null
                    }
                    groupKey = year || 'no-year'
                    
                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, { key: groupKey, year, results: [] })
                    }
                } else {
                    groupKey = name
                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, { key: groupKey, results: [] })
                    }
                }
                
                groupMap.get(groupKey).results.push({
                    doc: result,
                    highlightedName: name,
                    nameType: highlight.label?.includes(name) ? 'label' : 
                             highlight.altLabels?.includes(name) ? 'altLabels' : 'attestations'
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
            return groups.sort((a, b) => a.key.localeCompare(b.key))
        }
    }

    useEffect(() => {
        if (docData) {
            setFuzzyResultLoading(true)
            const requestBody: any = {}

            if (docData._source.label) {
                requestBody.label = docData._source.label
            }

            if (docData._source.altLabels) {
                requestBody.altLabels = docData._source.altLabels
            }

            if (docData._source.attestations) {
                requestBody.attestations = docData._source.attestations.map((attestation: any) => attestation.label)
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
        
    }, [docData])

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

        <ul className={`${viewMode === 'timeline' ? 'relative !mx-2 !px-0 p-2' : 'flex gap-3 flex-col divide-y divide-neutral-200'}`}>
            {groups.map((group, index) => {
                const groupLabel = viewMode === 'timeline' 
                    ? (group.year || 'Utan årstall')
                    : group.key
                const groupId = `${viewMode}-${group.key}`
                
                return (
                    <li key={groupId} className={viewMode === 'timeline' ? 'flex items-center !pb-4 !pt-0 relative' : 'flex flex-col gap-2 py-2'}>
                        {viewMode === 'timeline' && group.year && (
                            <>
                                <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${index === groups.length - 1 ? 'h-2' : 'h-full'} ${index === 0 ? 'mt-2' : ''}`}></div>
                                <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
                            </>
                        )}
                        
                        <div className={viewMode === 'timeline' ? (group.year ? 'ml-6 flex flex-col' : 'flex flex-col') : 'flex flex-col gap-2'}>
                            {viewMode === 'timeline' ? (
                                <>
                                    <span className="mr-2 my-1 mt-1 font-medium text-neutral-600">
                                        {group.year || 'Uten årstall'}
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <ul className="flex flex-col gap-1">
                                            {(Array.from(new Set(group.results.map((r: any) => r.highlightedName))) as string[]).map(name => {
                                                const nameResults = group.results.filter((r: any) => r.highlightedName === name)
                                                const nameId = `${groupId}-${name}`
                                                const isNameExpanded = expandedGroups[nameId] ?? false
                                                
                                                return (
                                                    <li key={name}>
                                                        <div
                                                            onClick={() => toggleGroupExpansion(nameId)}
                                                            className="text-left flex items-center gap-2 py-1 cursor-pointer hover:text-neutral-700 transition-colors"
                                                        >
                                                            <div className="flex-shrink-0">
                                                                {isNameExpanded ? <PiCaretUp className="text-sm" aria-hidden="true"/> : <PiCaretDown className="text-sm" aria-hidden="true"/>}
                                                            </div>
                                                            <span className="font-medium">{name}</span>
                                                            <span className="text-xs text-neutral-500">({nameResults.length})</span>
                                                        </div>
                                                        
                                                        {isNameExpanded && (
                                                            <div className="ml-5 mt-1">
                                                                <ul className="flex flex-col divide-y divide-neutral-200">
                                                                    {nameResults.map((resultItem: any, resultIndex: number) => {
                                                                        const doc = resultItem.doc
                                                                        const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                                        
                                                                        return (
                                                                            <li key={uniqueKey}>
                                                                                <Clickable className="flex flex-col gap-1.5 py-2 w-full items-start hover:bg-neutral-50 rounded-md px-3 -mx-3 transition-colors" add={{details: "doc", doc: doc._source?.uuid, docDataset: doc._index.split('-')[2]}}>
                                                                                    <div className="flex items-center gap-2 text-xs">
                                                                                        <span className="font-medium text-neutral-600 uppercase tracking-wider">{datasetTitles[doc._index.split('-')[2]]}</span>
                                                                                        {resultItem.nameType === 'attestations' && (
                                                                                            <span className="text-neutral-500">({resultItem.nameType})</span>
                                                                                        )}
                                                                                    </div>
                                                                                    {doc._source?.sosi && (
                                                                                        <div className="flex items-center gap-2 text-neutral-900">
                                                                                            <span className="font-medium">{sosiVocab[doc._source.sosi]?.label || doc._source.label}</span>
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
                                                            </div>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className="">
                                    <ul className="flex flex-col gap-1">
                                        {(Array.from(new Set(group.results.map((r: any) => r.highlightedName))) as string[]).map(name => {
                                            const nameResults = group.results.filter((r: any) => r.highlightedName === name)
                                            const nameId = `${groupId}-${name}`
                                            const isNameExpanded = expandedGroups[nameId] ?? false
                                            
                                            return (
                                                <li key={name}>
                                                    <div
                                                        onClick={() => toggleGroupExpansion(nameId)}
                                                        className="text-left flex items-center gap-2 py-1 cursor-pointer hover:text-neutral-700 transition-colors"
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {isNameExpanded ? <PiCaretUp className="text-sm" aria-hidden="true"/> : <PiCaretDown className="text-sm" aria-hidden="true"/>}
                                                        </div>
                                                        <span className="font-medium">{name}</span>
                                                        <span className="text-xs text-neutral-500">({nameResults.length})</span>
                                                    </div>
                                                    
                                                    {isNameExpanded && (
                                                        <div className="ml-5 mt-1">
                                                            <ul className="flex flex-col divide-y divide-neutral-200">
                                                                {nameResults.map((resultItem: any, resultIndex: number) => {
                                                                    const doc = resultItem.doc
                                                                    const uniqueKey = `${doc._id}-${resultItem.highlightedName}-${resultIndex}`
                                                                    
                                                                    return (
                                                                        <li key={uniqueKey}>
                                                                            <Clickable className="flex flex-col gap-1.5 py-2 w-full items-start hover:bg-neutral-50 rounded-md px-3 -mx-3 transition-colors" add={{details: "doc", doc: doc._source?.uuid, docDataset: doc._index.split('-')[2]}}>
                                                                                <div className="flex items-center gap-2 text-xs">
                                                                                    <span className="font-medium text-neutral-600 uppercase tracking-wider">{datasetTitles[doc._index.split('-')[2]]}</span>
                                                                                    {resultItem.nameType === 'attestations' && (
                                                                                        <span className="text-neutral-500">({resultItem.nameType})</span>
                                                                                    )}
                                                                                </div>
                                                                                {doc._source?.sosi && (
                                                                                    <div className="flex items-center gap-2 text-neutral-900">
                                                                                        <span className="font-medium">{sosiVocab[doc._source.sosi]?.label || doc._source.label}</span>
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
                                                        </div>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </li>
                )
            })}
        </ul>
    </div>
}