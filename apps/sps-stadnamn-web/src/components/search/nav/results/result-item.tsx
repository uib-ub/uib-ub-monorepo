'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useSearchQuery } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from '@/state/providers/global-provider';
import { stringToBase64Url } from '@/lib/param-utils';
import { useGroup, useMode, usePerspective } from '@/lib/param-hooks';
import { useSessionStore } from '@/state/zustand/session-store';
import { useDebugStore } from '@/state/zustand/debug-store';
import { MAP_DRAWER_MAX_HEIGHT_SVH, panPointIntoView } from '@/lib/map-utils';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { PiPushPinSlashBold, PiXBold, PiXCircle } from 'react-icons/pi';

const uniqueLabels = (hit: any) => {
    const labels = new Set<string>();
    const hits = hit.inner_hits?.group?.hits?.hits || [];
    for (const innerHit of hits) {
        for (const label of innerHit.fields?.label || []) {
            if (labels.size < 3) labels.add(label);
            if (labels.size === 3) break;
        }
        if (labels.size === 3) break;
        for (const label of innerHit.fields?.altLabels || []) {
            if (labels.size < 3) labels.add(label);
            if (labels.size === 3) break;
        }
        if (labels.size === 3) break;
    }
    return Array.from(labels).map((label, idx) => (
        <span key={label + idx}>
            {label}
            {idx < Array.from(labels).length - 1 && <span>, </span>}
        </span>
    ));
}

const formatDistance = (meters: number) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    } else {
        return `${Math.round(meters / 1000)} km`;
    }
};

export default function ResultItem({hit, onClick, ...rest}: {hit: any, onClick?: () => void} & Record<string, any>) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null) 
    const docDataset = hit._index.split('-')[2]
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const { mapFunctionRef } = useContext(GlobalContext)
    const { searchFilterParamsString } = useSearchQuery()
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const showScore = useDebugStore((s: any) => s.showScore)

    const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title
    const detailsRenderer = (hit: any) => {
        const adm1 = hit.fields["group.adm1"]
        const adm2 = hit.fields["group.adm2"]
        const adm3 = hit.fields["group.adm3"]
        return <>{adm2 ? adm2 + ', ' : ''}{adm1}</>
    }
    const snippetRenderer = resultRenderers[docDataset]?.snippet || defaultResultRenderer.snippet

    const isGrunnord = docDataset?.includes('_g')

    const perspectiveIsGrunnord = perspective.includes('_g') || perspective == 'base'
    const {activeGroupCode, activeGroupValue, initValue } = useGroup()


    useEffect(() => {
        // Scroll into view if section changes to results

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])


    const label = hit.fields?.label?.[0] || JSON.stringify(hit)

    

    
    return  <Clickable ref={itemRef} {...rest} className={`w-full h-full p-3  aria-expanded:bg-neutral-100 flex items-center group no-underline ${initValue == hit.fields["group.id"][0] ? 'pb-0' : ''}`} 
    onClick={() => {
        onClick?.()
        if (!hit.fields?.location?.[0].coordinates) return;
        const map = mapFunctionRef.current;
        if (!map || snappedPosition == 'top') return;

        const [lng, lat] = hit.fields.location[0].coordinates;

        panPointIntoView(map, [lat, lng], isMobile, isMobile);
    }}
    remove={['group', 'docIndex', 'doc', 'parent', ...(isMobile ? ['nav'] : [])]}
                    add={{
                        ...(hit.fields["group.id"] && hit.fields["group.id"][0] != activeGroupValue ? {group: stringToBase64Url(hit.fields["group.id"][0])} : {group: null}),
                    }}>
                       
            <div className="w-full text-left">
                <span className="inline-flex items-center flex-wrap gap-x-2 whitespace-normal w-full text-lg">
                    {isGrunnord && (
                        <h2 className="inline-flex items-center gap-x-2">
                            {!perspectiveIsGrunnord && (
                                <span className="text-neutral-800">
                                    Grunnord:
                                </span>
                            )}
                            
                                <span className="font-semibold">
                                    {hit.fields.label?.[0]}
                                </span>
                            
                        </h2>
                    )}
                    {showScore && hit._score}
                    {!isGrunnord && (
                        <h2 className="font-semibold">
                            {label}
                        </h2>
                    )}
                    <span>{detailsRenderer(hit)}</span>
                    {typeof hit.distance === 'number' && (
                        <span className="ml-auto text-sm bg-neutral-100 px-2 py-0.5 rounded-full group-aria-expanded:bg-white">
                            {formatDistance(hit.distance)}
                        </span>
                    )}
                    {initValue && initValue == hit.fields["group.id"][0] && (
                        <>
                        <ClickableIcon className="ml-auto" label="Fjern utganspunkt for sortering" remove={['init']}>
                            <PiXCircle className="text-neutral-700 group-aria-expanded:text-white text-2xl" />
                        </ClickableIcon>
                        </>
                    )}
                </span>
                {hit.highlight && snippetRenderer && <>{snippetRenderer(hit)}</>}
            </div>
            {/*TODO: use for dataset count*/}
            {false && hit.inner_hits?.group?.hits?.total?.value > 1 && (
                <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 bg-neutral-100 text-neutral-950 group-aria-expanded:bg-accent-800 group-aria-expanded:text-white`}>
                    {hit.inner_hits?.group?.hits?.total?.value}
                </div>
            )}
            

            
            </Clickable>
}

