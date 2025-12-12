'use client'
import Clickable from '@/components/ui/clickable/clickable';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { panPointIntoView } from '@/lib/map-utils';
import { useGroup, usePerspective } from '@/lib/param-hooks';
import { stringToBase64Url } from '@/lib/param-utils';
import { detailsRenderer, formatHighlight } from '@/lib/text-utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useDebugStore } from '@/state/zustand/debug-store';
import { useSessionStore } from '@/state/zustand/session-store';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import { PiXBold } from 'react-icons/pi';

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

export default function ResultItem({ hit, onClick, notClickable, ...rest }: { hit: any, onClick?: () => void, notClickable?: boolean } & Record<string, any>) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index?.split('-')?.[2]
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const showScore = useDebugStore((s: any) => s.showScore)
    const isGrunnord = docDataset?.includes('_g')

    const perspectiveIsGrunnord = perspective.includes('_g') || perspective == 'base'
    const { activeGroupValue, initValue } = useGroup()
    const maxResults = searchParams.get('maxResults')




    const label = hit.fields?.label?.[0] || ''


    if (!hit._index) return <div className="p-2">Det har oppstått ein feil: Kunne ikkje hente kjelder</div>




    return <div  {...rest} className={`w-full h-full ${initValue && initValue == hit.fields["group.id"][0] ? '' : 'bg-neutral-50'} aria-expanded:border-b aria-expanded:borderneutral-100 flex items-center group no-underline ${initValue == hit.fields["group.id"][0] ? 'pb-0' : ''}`}>

        <Clickable ref={itemRef}
            notClickable={notClickable}
            onClick={() => {
                onClick?.()
                if (!hit.fields?.location?.[0].coordinates) return;
                const map = mapFunctionRef.current;
                if (!map || snappedPosition == 'top') return;


                const [lng, lat] = hit.fields.location[0].coordinates;

                panPointIntoView(map, [lat, lng], isMobile, isMobile);
            }}
            remove={['docIndex', 'doc', 'group', 'parent', ...(isMobile ? ['nav'] : [])]}
            add={{ group: activeGroupValue == hit.fields["group.id"][0] ? null : stringToBase64Url(hit.fields["group.id"][0]) }}


            className="w-full text-left p-3">
            <div className="flex items-center justify-between gap-x-2 whitespace-normal w-full text-xl">
                <div className="inline-flex items-center flex-wrap gap-x-2">
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
                </div>
                {typeof hit.distance === 'number' && (
                    <span className="bg-neutral-200 text-neutral-900 px-2 rounded-full text-nowrap shrink-0 text-base">
                        {formatDistance(hit.distance)}
                    </span>
                )}
            </div>
            {hit.highlight && <>{formatHighlight(hit.highlight['content.html']?.[0] || hit.highlight['content.text']?.[0])}</>}
        </Clickable>
        {(initValue && initValue == hit.fields["group.id"][0]) && (
            <div className="p-3">
                <ClickableIcon className="h-6 w-6 p-0 rounded-full btn btn-outline text-neutral-700" label="Lukk namnegruppe" remove={['init', 'activePoint']}>
                    <PiXBold />
                </ClickableIcon>
            </div>
        )}
        {/*TODO: use for dataset count*/}
        {false && hit.inner_hits?.group?.hits?.total?.value > 1 && (
            <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 bg-neutral-100 text-neutral-950 group-aria-expanded:bg-accent-800 group-aria-expanded:text-white`}>
                {hit.inner_hits?.group?.hits?.total?.value}
            </div>
        )}



    </div>
}

