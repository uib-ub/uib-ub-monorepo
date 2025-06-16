'use client'
import { useState } from "react"
import { PiCaretDown, PiCaretUp } from "react-icons/pi"
import ResultItem from "./result-item"
import { gridDisk } from "h3-js"



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
  
  
  


  // First, build canonical h3 mapping
  const canonicalH3Map: Record<string, Record<string, string>> = {};
  
  resultData?.forEach(hit => {
    if (!hit || !hit.fields.h3 || hit.fields.gnidu?.length > 0) return;
    
    const label = hit.fields.label?.[0] ?? '';
    const h3 = hit.fields.h3[0];
    const neighbours = [h3, ...gridDisk(h3, 1)];

    const existing = neighbours.find(neighbour => 
        canonicalH3Map[neighbour]?.[label]
    );



    if (existing) {
        canonicalH3Map[h3][label] = existing;
    } else {
        if (!canonicalH3Map[h3]) {
          canonicalH3Map[h3] = {};
        }

      canonicalH3Map[h3][label] = h3;

      neighbours.forEach(neighbour => {
        if (!canonicalH3Map[neighbour]) {
          canonicalH3Map[neighbour] = {};
        }
        canonicalH3Map[neighbour][label] = h3;
      });
    }
    
  });

  const groupedResults: Record<string, any[]> = resultData?.reduce((acc, hit) => {
    if (!hit) return acc;
    
    const label = hit.fields.label ?? '';
    let groupKey;
    
    if (hit.fields.gnidu) {
      groupKey = `${label}-Gnidu-${hit.fields.gnidu?.[0]}`
    } else if (hit.fields.h3) {
      groupKey = `${label}-H3-${canonicalH3Map[hit.fields.h3]?.[label] || hit.fields.h3}`; 
    } else {
      groupKey = `${label}-${hit.fields.uuid}`;
    }
    
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
              className={`w-full flex flex-col py-3 px-2 text-left hover:bg-neutral-50 group aria-expanded:border-b aria-expanded:border-l-4 aria-expanded:border-neutral-200 aria-expanded:bg-neutral-100`}
            >
                <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{items[0].fields.label}</div>
                  <div className="">{items[0].fields.adm1} {items[0].fields.adm2}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm bg-neutral-100 rounded-full px-2.5 py-1 flex items-center gap-2 group-aria-expanded:bg-neutral-700 group-aria-expanded:text-white`}>
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