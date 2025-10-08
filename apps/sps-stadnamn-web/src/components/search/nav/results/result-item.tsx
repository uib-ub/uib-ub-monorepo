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

export default function ResultItem({hit, ...rest}: {hit: any} & Record<string, any>) {
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
    const {groupCode, groupValue } = useGroup()


    useEffect(() => {
        // Scroll into view if section changes to results

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])


    const label = hit.fields?.label?.[0] || JSON.stringify(hit)

    

    
    return  <Clickable ref={itemRef} {...rest} className={`w-full h-full p-3 aria-expanded:text-white  aria-expanded:bg-accent-800 flex items-center group no-underline `} 
    onClick={() => {
        //setSnappedPosition('max')
        if (!hit.fields?.location?.[0].coordinates) return;
        const map = mapFunctionRef.current;
        if (!map) return;

        let [lng, lat] = hit.fields.location[0].coordinates;

        panPointIntoView(map, [lat, lng], isMobile, isMobile);
    }}
    remove={['group', 'docIndex', 'doc', 'parent', ...(isMobile ? ['nav'] : [])]}
                    add={{
                        ...(hit.fields["group.id"] && hit.fields["group.id"][0] != groupValue ? {group: stringToBase64Url(hit.fields["group.id"][0])} : {group: null}),
                    }}>
                       
            <div className="w-full text-left">
                <span className="inline-flex items-center flex-wrap gap-x-2 whitespace-normal w-full">
                    {isGrunnord && (
                        <span className="inline-flex items-center gap-x-1">
                            {!perspectiveIsGrunnord && (
                                <span className="font-semibold text-lg text-neutral-700 group-aria-expanded:text-neutral-50">
                                    Grunnord:
                                </span>
                            )}
                            {!searchFilterParamsString && isGrunnord && (
                                <span className="bg-neutral-700 font-semibold text-white w-6 h-6 group-aria-expanded:bg-accent-800 rounded-full flex items-center justify-center ml-1.5">
                                    {hit.fields.label?.[0]?.[0].toUpperCase() || JSON.stringify(hit)}
                                </span>
                            )}
                        </span>
                    )}
                    {showScore && hit._score}
                    {isGrunnord && (
                        <span className="text-lg">
                            {uniqueLabels(hit)}
                            {uniqueLabels(hit).length > 3 && '...'}
                        </span>
                    )}
                    {!isGrunnord && (
                        <h2 className="font-semibold inline">
                            {label}
                        </h2>
                    )}
                    <span>{detailsRenderer(hit)}</span>
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

