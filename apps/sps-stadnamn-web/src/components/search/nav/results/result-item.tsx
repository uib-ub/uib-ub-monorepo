'use client'
import Clickable from '@/components/ui/clickable/clickable';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { datasetTitles } from '@/config/metadata-config';
import { panPointIntoView } from '@/lib/map-utils';
import { useGroup, usePerspective } from '@/lib/param-hooks';
import { stringToBase64Url } from '@/lib/param-utils';
import { detailsRenderer, formatHighlight } from '@/lib/text-utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useDebugStore } from '@/state/zustand/debug-store';
import { useSessionStore } from '@/state/zustand/session-store';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import { PiX, PiXBold } from 'react-icons/pi';
import DistanceBadge from '@/components/search/distance-badge';
import { DEFAULT_MAX_RESULTS } from '@/config/max-results';

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

export default function ResultItem({ hit, onClick, notClickable, ...rest }: { hit: any, onClick?: () => void, notClickable?: boolean } & Record<string, any>) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index?.split('-')?.[2]
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const showScore = useDebugStore((s: any) => s.showScore)
    const isGrunnord = docDataset?.includes('_g')

    const perspectiveIsGrunnord = perspective.includes('_g') || perspective == 'base'
    const { activeGroupValue, initValue } = useGroup()
    const sourceView = searchParams.get('sourceView') === 'on'
    const isInit = sourceView ? initValue && initValue == hit.fields?.["uuid"]?.[0] : initValue && initValue == hit.fields?.["group.id"]?.[0]

    const label = hit.fields?.label?.[0] || ''


    if (!hit) return <div className="p-2">Det har oppstått ein feil: Kunne ikkje hente kjelder</div>

    return <div  {...rest} className={`w-full h-full aria-expanded:border-b aria-expanded:border-neutral-100 flex items-center group no-underline ${isInit ? 'pb-0' : ''}`}>

        <Clickable ref={itemRef}
            notClickable={notClickable}
            onClick={() => !notClickable && onClick?.()}
            remove={['doc', 'group', 'activePoint']}
            add={{ maxResults: DEFAULT_MAX_RESULTS, init: stringToBase64Url(hit.fields["group.id"]?.[0]),
                point: hit.fields?.location?.[0]?.coordinates ? `${hit.fields?.location?.[0]?.coordinates[1]},${hit.fields?.location?.[0]?.coordinates[0]}` : null

            }}


            className="w-full text-left p-3">
            <div className="flex items-center justify-between gap-x-2 whitespace-normal w-full text-xl">
                <div className="inline-flex items-center flex-wrap gap-x-2 w-full">
                
                    {isGrunnord && (
                        <div className="inline-flex items-center gap-x-2 w-full">

                            <span className="font-semibold">
                                {hit.fields.label?.[0] || hit.fields?.["group.label"]?.[0]}
                            </span>
                            {!perspectiveIsGrunnord && (
                                <em className="text-neutral-800 ml-auto">
                                    Grunnord
                                </em>
                            )}

                        </div>
                    )}
                    {showScore && hit._score}
                    {!isGrunnord && (
                        <span className="font-semibold flex items-center gap-x-2">
                            { isInit && <img src="/currentLocation.svg" alt="" aria-hidden="true" className="h-6 mb-1 self-center " />}
                            {label || hit.fields?.["group.label"]?.[0]}
                        </span>
                    )}
                    <span className="text-neutral-900">{detailsRenderer(hit)}</span>
                </div>
                <DistanceBadge meters={hit.distance} />
                {isInit && <ClickableIcon
                        label={`Lukk`}

                        remove={['group', 'init', 'activePoint', 'activeYear', 'activeName']}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline"
                    >
                        <PiX aria-hidden="true" className="text-xl text-neutral-800" /> 
                    </ClickableIcon>}
            </div>
            {hit.highlight && <>{formatHighlight(hit.highlight['content.html']?.[0] || hit.highlight['content.text']?.[0])}</>}
            
        </Clickable>



    </div>
}

