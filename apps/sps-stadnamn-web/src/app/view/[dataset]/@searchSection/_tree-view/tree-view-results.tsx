'use client'

import CoordinateButton from "@/components/results/coordinateButton"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { contentSettings } from "@/config/server-config";
import { useEffect, useState } from "react";
import { useQueryStringWithout } from "@/lib/search-params";

export default function TreeViewResults({hits}: {hits: any}) {
    const params = useParams<{uuid: string; dataset: string}>()
    const searchParams = useSearchParams()
    const subfield = contentSettings[params.dataset].tree?.subunit || 'cadastre.gnr'
    const [startRange, setStartRange] = useState("")
    const [endRange, setEndRange] = useState("") 
    const [clickedDoc, setClickedDoc] = useState<string | null>(null)
    const selectedDoc = searchParams.get('parent') || searchParams.get('docs')?.split(',')?.[0]

    const linkSearchParams = useQueryStringWithout(['search'])


    const findNumber = (fields: any): string => {
        
      
        if (subfield) {
          return fields[subfield] || fields[subfield.split(".")[0]].map((nested: any) => nested[subfield.split(".")[1]]).join(",")
          
      
        }
      
        return ""
        
      }

    const filteredHits = hits.filter((hit: any) => {
        const number = findNumber(hit.fields);
        // Assuming the subfield value is numeric for range comparison
        const numValue = Number(number);
        const startNum = Number(startRange);
        const endNum = Number(endRange);
        return (numValue >= startNum || startRange=="") && (numValue <= endNum || endRange=="");
    });

    useEffect(() => {

        
        const matchingElement = selectedDoc && document.getElementById(`item-${selectedDoc}`);
        if (matchingElement) {
          matchingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      
      }, [selectedDoc]);
      




    return (
        <>
         <fieldset className="flex gap-4 px-4 py-2">
            <legend className="flex">{contentSettings[params.dataset].tree?.subunitLabel || 'Gardsnummer'}</legend>
            <label htmlFor="startRange" className="sr-only">Fra</label>
            <input 
                id="startRange"
                className="w-16 p-1 border border-neutral-300 rounded-sm" 
                type="number" 
                value={startRange} 
                onChange={(e) => setStartRange(e.target.value)} 
                placeholder="fra" 
            /><span className="self-center">-</span>
            <label htmlFor="endRange" className="sr-only">Til</label>
            <input 
                id="endRange"
                className="w-16 p-1 border border-neutral-300 rounded-sm" 
                type="number" 
                value={endRange} 
                onChange={(e) => setEndRange(e.target.value)} 
                placeholder="til" 
            />
        </fieldset>
        
        
        <ul className="overflow-y-auto stable-scrollbar border ml-2 border-neutral-300 pt-2">
            {filteredHits.map((hit: any) => {
          return <li key={hit._id} 
                     className="flex gap-4 px-2 py-2 border-b border-neutral-300 mx-2"
                     id={`item-${hit.fields.uuid}`}>
            <SearchParamsLink href={`/view/${params.dataset}/doc/${hit.fields.uuid}`}
                  omit-params={["search"]} 
                  onClick={() => setClickedDoc(hit.fields.uuid?.[0])}
                  aria-current={(hit.fields.uuid == params.uuid || searchParams.get('parent') == hit.fields.uuid || clickedDoc == hit.fields.uuid) ? "page" : undefined}
                  className="no-underline aria-[current=page]:!text-accent-800 aria-[current=page]:underline aria-[current=page]:decoration-accent-800 hover:underline">{findNumber(hit.fields)}&nbsp;<span className="font-semibold">{hit.fields.label}</span>
            </SearchParamsLink>
            {hit.fields?.location && <div className='flex gap-2 ml-auto'>
                <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
            </div>}
            </li>
        })}


        </ul>
 
        </>
        

    

    )
}
