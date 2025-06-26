'use client'
import { useState } from "react"
import { PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold } from "react-icons/pi"


export default function IIIFExpandSummary({summary}: {summary: string}) {
    const [expanded, setExpanded] = useState(false)


    return <>
        {expanded ? " " : "..."}
         <span className={`${expanded ? '' : 'hidden'} overflow-hidden transition-all duration-300`}>
            {summary.split(' ').slice(20).join(' ')}
        </span>
        <br/><button className="btn btn-outline btn-compact mt-2 gap-1 items-center pl-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><PiCaretUpBold aria-hidden="true" className="" /> Vis mindre</> : <><PiCaretDownBold aria-hidden="true" className="" /> Vis meir</>}
        </button>
        
       
       
       
    </>

}
