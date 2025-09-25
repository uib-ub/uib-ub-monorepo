'use client'
import { useState } from 'react'
import IIIFInfoSection from './iiif-info-section'
import IconLink from '@/components/ui/icon-link'
import { PiArchiveFill, PiInfoFill } from 'react-icons/pi'
import Drawer from '@/components/ui/drawer'
import { resolveLanguage } from '../iiif-utils'
import { useIIIFSessionStore } from '@/state/zustand/iiif-session-store'
import IIIFNeighbourNav from './iiif-neighbour-nav'

export default function IIIFMobileDrawer({ manifest, manifestDataset, stats }: { manifest: any, manifestDataset: string, stats: any }) {
    const drawerOpen = useIIIFSessionStore((s) => s.drawerOpen)
    const setDrawerOpen = useIIIFSessionStore((s) => s.setDrawerOpen)
    const [snappedPosition, setSnappedPosition] = useState<'min' | 'max'>('min')
    const [currentPosition, setCurrentPosition] = useState<number>(0)

 

    

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
                    <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />
                    {snappedPosition == 'max' && <IIIFNeighbourNav manifest={manifest} />}
                </div>
        </Drawer>
        {!drawerOpen && (
            <button
                type="button"
                className="fixed flex gap-2 items-center right-4 z-[6001] rounded-full bg-white text-neutral-800 shadow-lg px-4 py-2 bottom-6 border border-neutral-200"
                onClick={() => { setDrawerOpen(true); }}
                aria-label="Open details"
            >{manifest?.type === 'Manifest' ? <PiInfoFill aria-hidden="true" className='text-xl text-primary-600' /> : <PiArchiveFill aria-hidden="true" className='text-xl text-primary-600' />}
                {manifest?.label ? resolveLanguage(manifest.label) : 'Arkiv'}
            </button>
        )}
        </>
    )
}


