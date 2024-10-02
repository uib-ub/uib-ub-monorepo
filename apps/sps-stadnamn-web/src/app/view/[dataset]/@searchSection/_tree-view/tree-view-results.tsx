'use client'
import CoordinateButton from "@/components/results/coordinateButton"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { treeSettings } from "@/config/server-config";
import { useEffect, useState } from "react";
import SearchParamsLink from "@/components/ui/search-params-link";
import { getSkeletonLength, getValueByPath } from "@/lib/utils";
import Link from "next/link";
import { PiCaretDown } from "react-icons/pi";

export default function TreeViewResults({hits, isLoading}: {hits: any, isLoading: boolean}) {
    const params = useParams<{uuid: string; dataset: string}>()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const field = treeSettings[params.dataset].subunit
    const [startRange, setStartRange] = useState("")
    const [endRange, setEndRange] = useState("") 
    const [clickedDoc, setClickedDoc] = useState<string | null>(null)
    const selectedDoc = searchParams.get('parent') || searchParams.get('docs')?.split(',')?.[0]
    const size = parseInt(searchParams.get('size') || '50')


    const nextPageUrl = () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('size', String(size + 100))
        return pathname + "?" + newSearchParams.toString()

    }



    useEffect(() => {

        
        const matchingElement = selectedDoc && document.getElementById(`item-${selectedDoc}`);
        if (matchingElement) {
          matchingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      
      }, [selectedDoc]);
      




    return (
        <>
        { false &&  <fieldset className="flex gap-4 px-4 py-2">
            <legend className="flex">{treeSettings[params.dataset]?.subunitLabel || 'Gardsnummer'}</legend>
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
        </fieldset>}
        
        <ul className="overflow-y-auto stable-scrollbar border-t-2 border-neutral-100 border-neutral-300 pt-2 pb-12">
            {
                Array.from({length: isLoading && size == 50 ? 20 : (hits?.total && hits.total.value < size ? hits.total.value : size + 1)}, (_, i) => {
                    const hit = hits?.hits?.[i]

                    if (hit) {
                        return <li key={hit._id} 
                                className="flex gap-4 px-2 py-2 border-b border-neutral-300 mx-2"
                                id={`item-${hit._source.uuid}`}>
                        <SearchParamsLink href={`/view/${params.dataset}/doc/${hit._source.uuid}`}
                            omit-params={["search"]} 
                            onClick={() => setClickedDoc(hit._source.uuid?.[0])}
                            aria-current={(hit._source.uuid == params.uuid || searchParams.get('parent') == hit._source.uuid || clickedDoc == hit._source.uuid) ? "page" : undefined}
                            className="no-underline aria-[current=page]:!text-accent-800 aria-[current=page]:underline aria-[current=page]:decoration-accent-800 hover:underline">{getValueByPath(hit._source, field)}&nbsp;<span className="font-semibold">{hit._source.label}</span>
                        </SearchParamsLink>
                        {hit._source?.location && <div className='flex gap-2 ml-auto'>
                            <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
                        </div>}
                        </li>

                    }
                    else if (isLoading) {
                        return <li key={i} className="flex gap-4 px-2 py-2 border-b border-neutral-300 mx-2">
                            <div className="rounded-md my-2  bg-neutral-200 h-[1em] animate-pulse" style={{width: `${getSkeletonLength(i, 4, 16)}rem`}}></div><div className="h-[1.5em] w-[1.5em] rounded-full self-center bg-neutral-200 ml-auto animate-pulse"></div>
                        </li>
                    }
                    else if ( i == size) {
                        return <li key={i} className="flex gap-4 px-2 py-8 mx-2 justify-center"><Link className="flex self-center gap-4 border rounded-sm border-neutral-300 mx-2 no-underline py-4 px-16 text-xl self-center" href={ nextPageUrl() }>Vis mer <PiCaretDown className="self-center" aria-hidden="true"/></Link></li>

                    
                }
            }
            )}


        </ul>
 
        </>
        

    

    )
}
