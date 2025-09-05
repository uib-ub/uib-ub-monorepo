import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { getSkeletonLength } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useState, useEffect, useRef } from "react"
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi"
import SourceItem from "@/components/children/source-item"
import useGroupData from "@/state/hooks/group-data"
import { useGroup } from "@/lib/param-hooks"
import ErrorMessage from "@/components/error-message"
import useOverviewData from "@/state/hooks/overview-data"



export default function NamesExplorer() {
    
    const searchParams = useSearchParams()
    const { isMobile } = useContext(GlobalContext)
    const namesScope = searchParams.get('namesScope') || 'group'
    const { groupDoc, groupLoading } = useGroupData()
    const details = searchParams.get('details')
    const { groupCode } = useGroup()
    const router = useRouter()
    const selectedKey = `nameSelected:${groupCode}`
    const [ selectedDoc, setSelectedDoc ] = useState<any>(() => {
        try {
            const raw = sessionStorage.getItem(selectedKey)
            if (raw) {
                const parsed = JSON.parse(raw)
                if (typeof parsed === 'string') return parsed
                if (parsed?._source?.uuid) return parsed._source.uuid
                if (parsed?.uuid) return parsed.uuid
            }
        } catch {}
        return  groupDoc?._source?.uuid || null

    })

    const { groups, namesResultError, namesResultLoading } = useOverviewData()

    const itemRefs = useRef<Record<string, HTMLElement | null>>({})



    useEffect(() => {
        if (!selectedDoc) return
        requestAnimationFrame(() => {
            const el = itemRefs.current[selectedDoc]
            if (!el) return
            const rect = el.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight
            const topThreshold = 8
            const bottomThreshold = 8
            const fullyVisible = rect.top >= topThreshold && rect.bottom <= (viewportHeight - bottomThreshold)
            if (!fullyVisible) {
                el.scrollIntoView({ behavior: 'instant', block: 'center' })
            }
        })
    }, [selectedDoc, groups])

    // Persist expandedGroups across navigation using sessionStorage
    const expandedKey = `namesExpanded:${groupCode}:${details}:${namesScope}`
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
        try {
            const raw = sessionStorage.getItem(expandedKey)
            if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed && typeof parsed === 'object') {
                    return parsed
                }
            }
            

        } catch {}
        return {}
    })

    const goToDoc = (doc: any) => {
        const groupCode = searchParams.get('group')
        const selectedKey = `nameSelected:${groupCode}`
        const uuid = typeof doc === 'string' ? doc : doc?._source?.uuid || doc?.uuid
        if (!uuid) return
        sessionStorage.setItem(selectedKey, JSON.stringify(uuid))
        setSelectedDoc(uuid)
        const newParams = new URLSearchParams(searchParams)
        newParams.set('doc', uuid)
        router.push(`?${newParams.toString()}`)
    }





    

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => {
            const next = {
                ...prev,
                [groupId]: !prev[groupId]
            }
            try {
                sessionStorage.setItem(expandedKey, JSON.stringify(next))
            } catch {}
            return next
        })
    }


    if (namesResultError) {
        return <ErrorMessage error={{error: namesResultError.message}} message="Det har oppstått ein feil" />
    }

    return <>        
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">

                {!isMobile && <div className="flex border border-neutral-200 rounded-lg p-1 tabs text-tabs">
                    <Clickable
                        add={{ details: 'overview' }}
                        aria-pressed={details === 'overview'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${details === 'overview' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Oversikt
                    </Clickable>
                    <Clickable
                        add={{ details: 'timeline' }}
                        aria-pressed={details === 'timeline'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${details === 'timeline' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Tidslinje
                    </Clickable>
                    <Clickable
                        add={{ details: 'names' }}
                        aria-pressed={details === 'names'}
                        className={`flex items-center justify-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-colors no-underline flex-1 ${details === 'names' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}`}
                    >
                        Namn
                    </Clickable>
                </div>}
                
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
            {groups && groups.length === 0 && !namesResultLoading && !groupLoading ? (
                <div className="p-4 text-center">
                    <p className="text-neutral-800">Fann ingen liknande namn i nærleiken</p>
                </div>
            ) : !groups || namesResultLoading ? (
                // Loading skeleton - preserve exact timeline styling
                <div className="px-4">
                    <ul className={`${details === 'timeline' ? 'relative' : 'flex flex-col divide-y divide-neutral-200'}`}>
                        {Array.from({length: 3}).map((_, index) => (
                            <li key={`skeleton-${index}`} className={
                                details === 'timeline' 
                                    ? 'flex items-center !pb-4 !pt-0 relative w-full' 
                                    : 'flex flex-col gap-2 py-1 w-full'
                            }>
                                {details === 'timeline' && (
                                    <>
                                        <div className="bg-neutral-900/10 absolute w-1 left-0 top-1 h-full"></div>
                                        <div className="w-4 h-4 rounded-full bg-neutral-900/10 absolute -left-1.5 top-2"></div>
                                    </>
                                )}
                                
                                <div className={details === 'timeline' ? 'ml-6 flex flex-col w-full' : 'flex flex-col gap-2 w-full'}>
                                    {details === 'timeline' && (
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
                    <ul className={`${details === 'timeline' ? 'relative' : 'flex flex-col divide-y divide-neutral-200'}`}>
                        {groups.map((group: any, index: number) => {
                            const groupId = `${details}-${group.key}`
                            const groupsWithYears = groups.filter((g: any) => g.year)
                            const indexInYearGroups = groupsWithYears.findIndex((g: any) => g.key === group.key)
                            const isLastYearGroup = indexInYearGroups === groupsWithYears.length - 1
                            
                            return (
                                <li key={groupId} className={
                                    details === 'timeline' 
                                        ? 'flex items-center !pb-4 !pt-0 relative w-full' 
                                        : 'flex flex-col gap-2 py-1 w-full'
                                }>
                                    {details === 'timeline' && group.year && (
                                        <>
                                            <div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLastYearGroup ? 'h-4' : 'h-full'} ${indexInYearGroups === 0 ? 'mt-2' : ''}`}></div>
                                            <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-2`}></div>
                                        </>
                                    )}
                                    
                                    <div className={details === 'timeline' ? (group.year ? 'ml-6 flex flex-col w-full' : 'flex flex-col w-full') : 'flex flex-col gap-2 w-full'}>
                                        {details === 'timeline' && (
                                            <span className="mr-2 my-1 mt-1 font-medium text-neutral-700">
                                                {group.year || 'Utan årstal'}
                                            </span>
                                        )}
                                        {details === 'overview' && (datasetTitles[group.dataset] || group.dataset) && (
                                            <span className="mr-2 my-1 mt-1 font-medium text-neutral-700">
                                                {datasetTitles[group.dataset] || group.dataset}
                                            </span>
                                        )}
                                        
                                        <ul className="flex flex-col gap-1">
                                            {details === 'overview' ? (
                                                // For datasets view, show all datasets expanded without collapsing
                                                <ul className="flex flex-col divide-y divide-neutral-200 w-full">
                                                    {(Array.from(new Set(group.results.map((r: any) => r.doc._index?.split('-')[2] || 'unknown'))) as string[]).map((dataset, index) => {
                                                        const datasetResults = group.results.filter((r: any) => r.doc._index?.split('-')[2] === dataset)
                                                        
                                                        return (
                                                            <li key={dataset} className="flex flex-col w-full py-1">
                                                                <div className="flex items-center gap-3 py-2">
                                                                    <span className="font-medium text-sm text-neutral-700 uppercase tracking-wider">
                                                                        {datasetTitles[dataset] || dataset}
                                                                    </span>
                                                                    <span className="text-sm text-neutral-700">({datasetResults.length})</span>
                                                                </div>
                                                                
                                                                <ul className="flex flex-col divide-y divide-neutral-200 w-full">
                                                                    {datasetResults.map((resultItem: any, resultIndex: number) => {
                                                                        const doc = resultItem.doc
                                                                        const uniqueKey = `${doc._id}-${resultIndex}`
                                                                        
                                                                        return (
                                                                            <li
                                                                                key={uniqueKey}
                                                                                data-doc-uuid={doc?._source?.uuid}
                                                                                className="flex w-full py-1"
                                                                                ref={(el) => { itemRefs.current[doc?._source?.uuid as string] = el }}
                                                                            >
                                                                                <SourceItem hit={doc} isMobile={isMobile} selectedDoc={selectedDoc} goToDoc={goToDoc}/>
                                                                            </li>
                                                                        )
                                                                    })}
                                                                </ul>
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
                                                                                            <li
                                                                                                key={uniqueKey}
                                                                                                className="flex w-full py-1"
                                                                                                data-doc-uuid={doc?._source?.uuid}
                                                                                                ref={(el) => { itemRefs.current[doc?._source?.uuid as string] = el }}
                                                                                            >
                                                                                                <SourceItem hit={doc} isMobile={isMobile} selectedDoc={selectedDoc} goToDoc={goToDoc}/>
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

