'use client'
import { useState } from "react"
import { PiCaretDown, PiCaretUp } from "react-icons/pi"
import ResultItem from "./result-item"
import { getSkeletonLength } from "@/lib/utils"



export default function GroupedItems({ resultData }: {resultData: any[]}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const groupedResults: Record<string, any[]> = resultData?.reduce((acc, hit) => {
    if (!hit) return acc;
    const groupKey = `${hit.fields.label ?? ''}-${hit.fields.gnidu ? `GNIDU-${hit.fields.gnidu}` : hit.fields.uuid}`;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(hit);
    return acc;
  }, {}) ?? {}

  return (
    <>
      {Object.entries(groupedResults).map(([key, items]) => (
        items.length > 1 ? (
          <li key={key}>
            <button 
              onClick={() => toggleGroup(key)}
              aria-expanded={expandedGroups.has(key)}
              aria-controls={`${key}-group`}
              className={`w-full flex flex-col py-3 px-2 text-left hover:bg-neutral-50 ${expandedGroups.has(key) ? 'border-b border-neutral-200' : ''}`}
            >
                <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{items[0].fields.label}</div>
                  <div className="">{items[0].fields.adm1} {items[0].fields.adm2}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-neutral-100 rounded-full px-2.5 py-1 flex items-center gap-2">
                    {items.length}
                  </span>
                  {expandedGroups.has(key) ? <PiCaretUp /> : <PiCaretDown />}
                </div>
              </div>
              
            </button>
            <ul id={`${key}-group`} className={!expandedGroups.has(key) ? 'hidden' : 'px-2 pb-2'}>
              {items.map((hit) => (
                <ResultItem key={hit._id} hit={hit}/>
              ))}
            </ul>
          </li>
        ) : (
          <ResultItem key={items[0]._id} hit={items[0]} />
        )
      ))}
    </>
  )
}