'use client'
import { useState } from "react"


export default function IIIFExpandSummary({summary}: {summary: string}) {
    const [expanded, setExpanded] = useState(false)

    if (summary.length > 150) {
    return <>
         <span className={`${expanded ? '' : 'hidden'} overflow-hidden transition-all duration-300`}>
            {summary.slice(100)}
        </span>
        <br/><button className="btn btn-outline btn-compact mt-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Vis mindre' : 'Vis meir'}
        </button>
        
       
       
       
    </>
    }
    else {
        return summary.slice(100)
    }
}
