import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import IconButton from "@/components/ui/icon-button"
import { datasetTitles } from "@/config/metadata-config"
import { base64UrlToString } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useContext, useState, useEffect } from "react"
import { PiCaretDown, PiCaretUp } from "react-icons/pi"

export default function GroupDetails() {
    const { fuzzyGroup, fuzzyGroupLoading, fuzzyGroupError, fuzzyGroupTotal } = useContext(GroupContext)
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const [groupType, groupId, groupLabel] = base64UrlToString(group || '').split('_') || []
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
    const [expandedLabels, setExpandedLabels] = useState<Record<string, boolean>>({})
    const { sosiVocab } = useContext(GlobalContext)

    // Set the first group as expanded by default when data loads
    useEffect(() => {
        if (fuzzyGroup && fuzzyGroup.length > 0 && Object.keys(expandedGroups).length === 0) {
            const firstGroup = fuzzyGroup[0]
            if (firstGroup) {
                setExpandedGroups(prev => ({
                    ...prev,
                    [firstGroup._id]: true
                }))
            }
        }
    }, [fuzzyGroup])

    const toggleGroupExpansion = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }))
    }

    const toggleLabelExpansion = (label: string) => {
        setExpandedLabels(prev => ({
            ...prev,
            [label]: !prev[label]
        }))
    }

    return <div className={`${fuzzyGroupLoading ? 'opacity-50' : ''}`}>
        <ul className="flex gap-3 flex-col divide-y divide-neutral-200">
            {fuzzyGroup?.map((group, index) => {
                const label = group.fields?.label?.[0] || 'Ukjent'
                const innerHits = group.inner_hits?.["label.keyword"]?.hits?.hits || []
                const total = group.inner_hits?.["label.keyword"]?.hits?.total?.value || 0
                const isGroupExpanded = expandedGroups[group._id] ?? (index === 0)
                const isLabelExpanded = expandedLabels[label]
                const displayedDocs = isLabelExpanded ? innerHits : innerHits.slice(0, 5)
                
                return (
                    <li key={group._id} className="flex flex-col gap-2 py-2">
                        <button 
                            onClick={() => toggleGroupExpansion(group._id)}
                            className="text-lg font-serif text-left flex items-center gap-3 transition-colors w-full hover:text-neutral-700 cursor-pointer"
                        >
                            <div className="flex-shrink-0">
                                {isGroupExpanded ? <PiCaretUp className="text-lg" aria-hidden="true"/> : <PiCaretDown className="text-lg" aria-hidden="true"/>}
                            </div>
                            <span className="flex-grow">{label}</span>
                            <span className="flex-shrink-0 text-sm rounded-full bg-neutral-100 text-neutral-950 px-2.5 py-1 font-sans font-medium">
                                {total}
                            </span>
                        </button>
                        
                        {isGroupExpanded && (
                            <div className="ml-6">
                                <ul className="flex flex-col divide-y divide-neutral-200">
                                    {displayedDocs.map((doc: any) => (
                                        <li key={doc._id}>
                                            <Clickable className="flex flex-col gap-1.5 py-2 w-full items-start hover:bg-neutral-50 rounded-md px-3 -mx-3 transition-colors" add={{details: "doc", doc: doc.fields?.uuid?.[0], docDataset: doc._index.split('-')[2]}}>
                                                <span className="text-xs font-medium text-neutral-600 uppercase tracking-wider">{datasetTitles[doc._index.split('-')[2]]}</span>
                                                {doc.fields?.sosi?.[0] && (
                                                    <div className="flex items-center gap-2 text-neutral-900">
                                                        <span className="font-medium">{sosiVocab[doc.fields?.sosi?.[0]]?.label}</span>
                                                        {doc.fields?.description?.[0] && (
                                                            <span className="text-neutral-600">• {doc.fields?.description?.[0]}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </Clickable>
                                        </li>
                                    ))}
                                </ul>

                                {total > 5 && (
                                    <div className="mt-2">
                                        <button onClick={() => toggleLabelExpansion(label)} className="btn btn-outline text-neutral-950 no-underline px-3 py-1.5 flex items-center gap-2 text-sm font-medium hover:bg-neutral-50 transition-colors">
                                            {isLabelExpanded ? <PiCaretUp className="text-base" aria-hidden="true"/> : <PiCaretDown className="text-base" aria-hidden="true"/>} {isLabelExpanded ? "Vis mindre" : "Vis alle"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                )
            })}
        </ul>

    </div>
}