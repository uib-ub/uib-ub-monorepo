'use client'
import { useContext, useState, useEffect } from "react";
import { PiBookOpen, PiTrashFill, PiX, PiXBold } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { treeSettings } from "@/config/server-config";
import { getGnr } from "@/lib/utils";
import { ChildrenContext } from "@/app/children-provider";import { DocContext } from "@/app/doc-provider";
import { useDataset } from "@/lib/search-params";
import Clickable from "../ui/clickable/clickable";
import ClickableIcon from "../ui/clickable/clickable-icon";
import CadastralSubdivisions from "./cadastral-subdivisions";
import SourceList from "./source-list";
import { GlobalContext } from "@/app/global-provider";



export default function SimilarWindow() {

    const dataset = useDataset()

    const searchParams = useSearchParams()
    const expanded = searchParams.get('expanded')
    

    const { isMobile } = useContext(GlobalContext)
    const [similarResults, setSimilarResults] = useState<any[]>([])

    useEffect(() => {
        if (expanded) {

                fetch(`/api/search/similar?expanded=${expanded}`)
                    .then(res => res.json())
                    .then(data => setSimilarResults(data?.hits?.hits || []));

        }
    }, [expanded]);


    return <>
    <div className="flex flex-col h-full">
        <div className={`flex w-full items-center p-1 lg:p-0 shadow-md py-2`}>
                    
    <h2 className="text-neutral-800 uppercase font-semibold tracking-wider text-sm !font-sans !text-base ! text-neutral-800 px-4 py-1 ">
        Liknande oppslag
        
           
        </h2>
        <Clickable 
            remove={["expanded"]} 
            className="text-2xl ml-auto px-2" 
            aria-label="Lukk">
            <PiX aria-hidden="true"/>
        </Clickable>

        
        

        
    </div>
    
                <div className={` ${isMobile ? 'h-full pb-[30svh]' : 'pb-4 overflow-y-auto stable-scrollbar'}`}>

                    <ul className="flex flex-col divide-y divide-neutral-200 !px-0 !mx-0">
                        {similarResults.map((hit, idx) => (
                            <li key={hit._id || idx} className="list-none !p-3">
                                {hit.fields?.label[0] || JSON.stringify(hit)} {hit._score}
                            </li>
                        ))}
                    </ul>
                </div>
            

    </div>
    </>
}
