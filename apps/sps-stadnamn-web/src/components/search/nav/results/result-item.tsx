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
import { PiPushPinSlashBold, PiXBold, PiXCircle, PiXCircleFill } from 'react-icons/pi';

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
    const docDataset = hit._index?.split('-')?.[2]
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
        if (!hit.fields?.uuid) return;

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields?.uuid, isMobile])


    const label = hit.fields?.label?.[0] || ''


    if (!hit._index) return <div className="p-2">Det har oppstått ein feil: Kunne ikkje hente kjelder {JSON.stringify(hit)}</div>

    

    
    return  <div  {...rest} className={`w-full h-full bg-neutral-50 aria-expanded:border-b aria-expanded:borderneutral-100 flex items-center group no-underline ${initValue == hit.fields["group.id"][0] ? 'pb-0' : ''}`}>
                       
            <Clickable ref={itemRef}

onClick={() => {
    onClick?.()
    if (!hit.fields?.location?.[0].coordinates) return;
    const map = mapFunctionRef.current;
    if (!map || snappedPosition == 'top') return;


    const [lng, lat] = hit.fields.location[0].coordinates;

    panPointIntoView(map, [lat, lng], isMobile, isMobile);
}}
remove={['docIndex', 'doc', 'group', 'parent', ...(isMobile ? ['nav'] : [])]}
                add={{group: activeGroupValue == hit.fields["group.id"][0] ? null : stringToBase64Url(hit.fields["group.id"][0])}}
            
            
            className="w-full text-left p-3">
                <span className="inline-flex items-center flex-wrap gap-x-2 whitespace-normal w-full text-xl">
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
                    <span className="text-neutral-900">{detailsRenderer(hit)}</span>
                   
                   
                </span>
                {hit.highlight && snippetRenderer && <>{snippetRenderer(hit)}</>}
            </Clickable>
            <div className="p-3">
            {initValue && initValue == hit.fields["group.id"][0] && (
                        
                        <ClickableIcon className="flex items-center justify-center" label="Lukk gruppe" remove={['init']}>
                            <PiXCircleFill className="text-neutral-700 group-aria-expanded:text-white text-2xl hover:text-neutral-800" />
                        </ClickableIcon>
                        
                    )}
             {typeof hit.distance === 'number' && (
                        <Clickable 
                        onClick={() => {
                            mapFunctionRef.current?.panTo([hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]])
                        }}
                        remove={['group']}
                        add={{point: `${hit.fields.location[0].coordinates[1]},${hit.fields.location[0].coordinates[0]}`, init: stringToBase64Url(hit.fields["group.id"][0])}} className="bg-neutral-600 text-white px-2 rounded-full hover:bg-neutral-800 text-nowrap">
                            {formatDistance(hit.distance)}
                        
                        </Clickable>
                    )}
            </div>
            {/*TODO: use for dataset count*/}
            {false && hit.inner_hits?.group?.hits?.total?.value > 1 && (
                <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 bg-neutral-100 text-neutral-950 group-aria-expanded:bg-accent-800 group-aria-expanded:text-white`}>
                    {hit.inner_hits?.group?.hits?.total?.value}
                </div>
            )}
            

            
            </div>
}

