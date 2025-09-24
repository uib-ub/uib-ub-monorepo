'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import IIIFInfoSection from './iiif-info-section'
import IconLink from '@/components/ui/icon-link'
import { PiArchiveFill, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRight, PiCaretRightBold, PiInfo, PiInfoFill } from 'react-icons/pi'
import { useIIIFNeighbours } from '@/state/hooks/use-iiif-neighbours'
import Drawer from '@/components/ui/drawer'

export default function IIIFMobileDrawer({ manifest, manifestDataset, stats }: { manifest: any, manifestDataset: string, stats: any }) {
    const [drawerOpen, setDrawerOpen] = useState(true)
    const [snappedPosition, setSnappedPosition] = useState<'min' | 'max'>('min')
    const [currentPosition, setCurrentPosition] = useState<number>(0)
    const { neighbours } = useIIIFNeighbours(manifest?.order, manifest?.partOf)

 

    const open = drawerOpen
    

    return (
        <>
        <Drawer
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            snappedPosition={snappedPosition}
            currentPosition={currentPosition}
            setSnappedPosition={setSnappedPosition}
            setCurrentPosition={setCurrentPosition}
        >
                <div className="h-full bg-white">
                    {manifest?.type === 'Manifest' && neighbours?.data && neighbours.total > 1 && (
                        <div className="flex items-center gap-2 w-full pb-3">
                            <IconLink label="Første element" href={`/iiif/${neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretLineLeftBold aria-hidden="true" />
                            </IconLink>
                            <IconLink label="Forrige element" href={`/iiif/${neighbours.data.previous || neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretLeftBold aria-hidden="true" />
                            </IconLink>
                            <div className="flex-1 text-center px-3 py-1 rounded-sm border-neutral-400">
                                {manifest.order}/{neighbours.total}
                            </div>
                            <IconLink label="Neste element" href={`/iiif/${neighbours.data.next || neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretRightBold aria-hidden="true" />
                            </IconLink>
                            <IconLink label="Siste element" href={`/iiif/${neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                <PiCaretLineRight aria-hidden="true" />
                            </IconLink>
                        </div>
                    )}
                    <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />
                </div>
        </Drawer>
        {!open && (
            <button
                type="button"
                className="fixed flex gap-2 items-center right-4 z-[6001] rounded-full bg-white text-neutral-800 shadow-lg px-4 py-2 bottom-6 border border-neutral-200"
                onClick={() => { setDrawerOpen(true); }}
                aria-label="Open details"
            >{manifest?.type === 'Manifest' ? <PiInfoFill aria-hidden="true" className='text-xl text-primary-600' /> : <PiArchiveFill aria-hidden="true" className='text-xl text-primary-600' />}
                {typeof manifest?.label === 'string' ? manifest.label : (manifest?.label?.no || manifest?.label?.en || manifest?.label?.['@none'] || 'Arkivressurser')}
            </button>
        )}
        </>
    )
}


