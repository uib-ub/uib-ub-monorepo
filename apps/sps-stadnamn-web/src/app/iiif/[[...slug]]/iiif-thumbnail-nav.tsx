'use client'
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { resolveLanguage } from "../iiif-utils";
import { PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRight, PiCaretRightBold, PiSlideshow, PiXBold } from "react-icons/pi";
import IconLink from "@/components/ui/icon-link";
import FileCard from "./file-card";
import { useState, useEffect, useContext } from "react";
import { usePathname } from 'next/navigation'
import IconButton from "@/components/ui/icon-button";
import { GlobalContext } from "@/state/providers/global-provider";
import { useIIIFNeighbours } from "@/state/hooks/use-iiif-neighbours";

// Create a global state object outside the component
const globalNavState = {
    isOpen: false
}

export default function IIIFThumbnailNav({manifest, manifestDataset}: {manifest: any, manifestDataset: string}) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(() => globalNavState.isOpen)
    const { isMobile } = useContext(GlobalContext)
    const { neighbours } = useIIIFNeighbours(manifest?.order, manifest?.partOf)
    
    // Update global state when local state changes
    useEffect(() => {
        globalNavState.isOpen = isOpen
    }, [isOpen])

    // Sync with global state when pathname changes
    useEffect(() => {
        setIsOpen(globalNavState.isOpen)
    }, [pathname])

    // Close with Escape key when open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', onKey)
        }
        return () => window.removeEventListener('keydown', onKey)
    }, [isOpen])

    return (
        <div className="col-span-5">
        <div className={`w-full flex flex-col bg-neutral-50 gap-0 z-[2000]`}>
                <div className="flex flex-row items-center gap-2 p-2 h-full flex-nowrap">
                    {manifest && !isMobile && (
                        <div className="min-w-0 flex-1">
                            <Breadcrumbs
                                homeUrl="/iiif"
                                homeLabel="Arkivressurser"
                                parentUrl={manifest.collections?.slice().reverse().map((item: any) => item.uuid)}
                                parentName={manifest.collections?.slice().reverse().map((item: any) => resolveLanguage(item.label))}
                                currentName={resolveLanguage(manifest.label)}
                            />
                        </div>
                    )}
                    
                
                {/* Desktop neighbour navigation */}
                {neighbours.data && neighbours.total > 1 && <div className="hidden lg:flex flex-nowrap items-center gap-2 ml-auto p-0 whitespace-nowrap">
                        <IconLink label="Første element" href={`/iiif/${neighbours.data.first}`} className="flex btn btn-outline items-center justify-center p-2 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineLeftBold className="w-6 h-6 lg:w-5 lg:h-5" />
                        </IconLink>
                        <IconLink label="Forrige element" href={`/iiif/${neighbours.data.previous || neighbours.data.last}`} className="flex btn btn-outline items-center justify-center p-2 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLeftBold className="w-6 h-6 lg:w-5 lg:h-5" />
                        </IconLink>
                        <span className="text-neutral-700">{manifest.order}/{neighbours.total}</span>
                        <IconLink label="Neste element" href={`/iiif/${neighbours.data.next || neighbours.data.first}`} className="flex btn btn-outline items-center justify-center p-2 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretRightBold className="w-6 h-6 lg:w-5 lg:h-5" />
                        </IconLink>
                         <IconLink label="Siste element" href={`/iiif/${neighbours.data.last}`} className="flex btn btn-outline items-center justify-center p-2 lg:p-2 rounded hover:bg-neutral-100 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <PiCaretLineRight className="w-6 h-6 lg:w-5 lg:h-5" />
                        </IconLink>
                        <IconButton label="Forhåndsvisningar" className={`btn btn-outline items-center gap-2 hidden lg:flex`} aria-expanded={isOpen} aria-controls="thumbnail-nav" onClick={() => setIsOpen(!isOpen)}>
                            <PiSlideshow className="w-5 h-5" />
                            
                            </IconButton>
                    </div>}
                    {/* Drawer toggle not needed; drawer is persistent on mobile */}
                    
                    </div>

                
            
                
                

                {/* Bottom, full-width preview bar */}
                <div className={`${isOpen ? 'fixed' : 'hidden'} top-28 max-h-[calc(100svh-7rem)] overflow-y-auto right-0 z-[4000] w-[20svw] gap-4 bg-white/95 backdrop-blur border-t border-neutral-200`}>
                    <nav
                        className={`flex flex-col`}
                        id="thumbnail-nav"
                    >
                        {neighbours.data && neighbours.total > 1 && neighbours.data.neighbours.map((neighbour: any, index: number) => (
                                <div key={index} className="h-full w-full">
                                    <FileCard item={neighbour._source} itemDataset={manifestDataset} currentItem={manifest?.uuid}/>
                                </div>
                        ))}
                    </nav>
                </div>

                {/* Floating close button that doesn't affect layout or thumbnails */}
                {isOpen && (
                    <div className="fixed right-3 bottom-72 z-[4500]">
                        <IconButton 
                            label="Lukk forhåndsvisningar (Esc)" 
                            className="p-2 rounded-full border bg-neutral-900 text-white border-white shadow-sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <PiXBold aria-hidden="true" className="text-xl" />
                        </IconButton>
                    </div>
                )}
                
                </div>
                </div>
  
    )

}
