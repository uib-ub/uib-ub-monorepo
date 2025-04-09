'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { resolveLanguage } from "../iiif-utils";
import { PiCaretDown, PiCaretLeft, PiCaretLineLeft, PiCaretLineRight, PiCaretRight, PiCaretUp } from "react-icons/pi";
import IconLink from "@/components/ui/icon-link";
import Link from "next/link";
import FileCard from "./file-card";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation'

// Create a global state object outside the component
const globalNavState = {
    isOpen: false
}

export default function IIIFThumbnailNav({manifest, neighbours, manifestDataset}: {manifest: any, neighbours: any, manifestDataset: string}) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(() => globalNavState.isOpen)
    
    // Update global state when local state changes
    useEffect(() => {
        globalNavState.isOpen = isOpen
    }, [isOpen])

    // Sync with global state when pathname changes
    useEffect(() => {
        setIsOpen(globalNavState.isOpen)
    }, [pathname])

    return (
        <div className="relative col-span-5 h-full">
        <div className={`w-full flex flex-col bg-neutral-50 gap-4 z-[2000] py-4  ${isOpen ? 'lg:absolute lg:bottom-0 lg:left-0 lg:p-4' : 'lg:!h-12 lg:py-8 lg:px-4'}`}>
                
                <div className="flex flex-col lg:flex-row items-center gap-2 px-4 pb-4 lg:pb-0 items-center h-full">
                    <Breadcrumbs 
                        homeUrl="/iiif"
                        homeLabel="Arkivressurser"
                        parentUrl={manifest.collections?.slice().reverse().slice(0, -1).map((item: any) => item.uuid)} 
                        parentName={manifest.collections?.slice().reverse().slice(0, -1).map((item: any) => resolveLanguage(item.label))} 
                    />
                    <Link href={`/iiif/${manifest.collections?.[0].uuid}`} className="breadcrumb-link">
                        {resolveLanguage(manifest.collections?.[0].label)}
                    </Link>
                    
                
                {neighbours.data && neighbours.total > 1 && <div className="flex flex-wrap justify-center items-center lg:justify-start lg:flex-nowrap items-center gap-2 lg:ml-auto p-6 lg:p-0">
                    <span className="text-neutral-700 lg:hidden !w-full text-center text-xl">{manifest.order}/{neighbours.total}</span>
                        <IconLink label="Første element" href={`/iiif/${neighbours.data.first}`} className="flex btn btn-outline items-center justify-center p-4 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineLeft className="w-10 h-10 lg:w-5 lg:h-5" />
                        </IconLink>
                        <IconLink label="Forrige element" href={`/iiif/${neighbours.data.previous || neighbours.data.last}`} className="flex btn btn-outline items-center justify-center p-4 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLeft className="w-10 h-10 lg:w-5 lg:h-5" />
                        </IconLink>
                        <span className="text-neutral-700 hidden lg:block px-4">{manifest.order}/{neighbours.total}</span>
                        <IconLink label="Neste element" href={`/iiif/${neighbours.data.next || neighbours.data.first}`} className="flex btn btn-outline items-center justify-center p-4 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretRight className="w-10 h-10 lg:w-5 lg:h-5" />
                        </IconLink>
                         <IconLink label="Siste element" href={`/iiif/${neighbours.data.last}`} className="flex btn btn-outline items-center justify-center p-4 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineRight className="w-10 h-10 lg:w-5 lg:h-5" />
                        </IconLink>
                        <button className="btn btn-outline items-center gap-2 hidden lg:flex" aria-expanded={isOpen} aria-controls="thumbnail-nav" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <PiCaretDown className="w-5 h-5" /> : <PiCaretUp className="w-5 h-5" />}
                            
                            Forhåndsvisninger</button>
                    </div>}
                    
                    </div>

                
            
                
                

                
                <nav className="hidden lg:grid grid-cols-2 lg:grid-cols-7 items-center gap-2 w-full px-4 pb-4" id="thumbnail-nav">
                    {isOpen && neighbours.data && neighbours.total > 1 && neighbours.data.neighbours.map((neighbour: any, index: number) => (
                            <div key={index} className="h-full w-full">
                                <FileCard item={neighbour._source} itemDataset={manifestDataset} currentItem={manifest?.uuid}/>
                            </div>
                    ))}
                </nav>
                
                </div>
                </div>
  
    )

}
