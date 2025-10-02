'use client'
import { useState } from 'react'
import IIIFInfoSection from './iiif-info-section'
import IconLink from '@/components/ui/icon-link'
import { PiArchiveFill, PiInfoFill } from 'react-icons/pi'
import Drawer from '@/components/ui/drawer'
import { resolveLanguage } from '../iiif-utils'
import { useIIIFSessionStore } from '@/state/zustand/iiif-session-store'
import IIIFNeighbourNav from './iiif-neighbour-nav'
import { RoundButton, RoundIconButton } from '@/components/ui/clickable/round-icon-button'

export default function IIIFMobileDrawer({ manifest, manifestDataset, stats }: { manifest: any, manifestDataset: string, stats: any }) {
    const drawerOpen = useIIIFSessionStore((s) => s.drawerOpen)
    const setDrawerOpen = useIIIFSessionStore((s) => s.setDrawerOpen)
    const currentPosition = useIIIFSessionStore((s) => s.currentPosition)
    const setCurrentPosition = useIIIFSessionStore((s) => s.setCurrentPosition)
    const snappedPosition = useIIIFSessionStore((s) => s.snappedPosition)
    const setSnappedPosition = useIIIFSessionStore((s) => s.setSnappedPosition)

 

    

    return (
        <>
        <Drawer
            drawerOpen={true}
            dismissable={false}
            setDrawerOpen={setDrawerOpen}
            snappedPosition={snappedPosition}
            currentPosition={currentPosition}
            setSnappedPosition={setSnappedPosition}
            setCurrentPosition={setCurrentPosition}
        >
                <div className="h-full bg-white">
                    <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />
                    {snappedPosition == 'max' && drawerOpen &&  <IIIFNeighbourNav manifest={manifest} isMobile={true} />}
                </div>
        </Drawer>
        {false && !drawerOpen && (   
            <RoundButton
                className="fixed flex gap-2 items-center left-4 z-[5001] shadow-lg px-4 py-2 bottom-6"
                onClick={() => { setDrawerOpen(true); }}

            >{manifest?.type === 'Manifest' ? <PiInfoFill aria-hidden="true" className='text-xl text-neutral-700' /> : <PiArchiveFill aria-hidden="true" className='text-xl text-neutral-700' />}
                {manifest?.label ? resolveLanguage(manifest.label) || "[utan namn]" : 'Arkiv'}
            </RoundButton>
        )}
        </>
    )
}


