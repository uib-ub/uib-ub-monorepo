'use client'
import Clickable from '@/components/ui/clickable/clickable';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
import { datasetTitles } from '@/config/metadata-config';
import { panPointIntoView } from '@/lib/map-utils';
import { useGroup, usePerspective } from '@/lib/param-hooks';
import { stringToBase64Url } from '@/lib/param-utils';
import { formatHighlight } from '@/lib/text-utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useDebugStore } from '@/state/zustand/debug-store';
import { useSessionStore } from '@/state/zustand/session-store';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import { PiX, PiXBold } from 'react-icons/pi';
import DistanceBadge from '@/components/search/distance-badge';
import { SMALL_BASE_MAX_RESULTS } from '@/config/max-results';
import AdmInfo from '../../shared/adm-info';

export default function ResultItem({ hit, onClick, notClickable, ...rest }: { hit: any, onClick?: () => void, notClickable?: boolean } & Record<string, any>) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index?.split('-')?.[2]
    const { isMobile, mapFunctionRef, sosiVocab } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const showScore = useDebugStore((s: any) => s.showScore)
    const isGrunnord = docDataset?.includes('_g')

    const perspectiveIsGrunnord = perspective.includes('_g') || perspective == 'base'
    const { activeGroupValue, initValue } = useGroup()
    const sourceView = searchParams.get('sourceView') === 'on'
    const isInit = sourceView ? initValue && initValue == hit.fields?.["uuid"]?.[0] : initValue && initValue == hit.fields?.["group.id"]?.[0]

    const label = (sourceView || isGrunnord) ? hit.fields?.label?.[0] : hit.fields?.["group.label"]?.[0] || ''
    const otherLabel = !sourceView && hit.fields?.label?.[0] != label ? hit.fields?.label?.[0] : null

    const rawSosi = hit.fields?.sosi
    const sosiArray = Array.isArray(rawSosi) ? rawSosi : rawSosi ? [rawSosi] : []
    const sosiTypes = sosiArray.reduce((acc: Record<string, string>, item: string) => {
        const key = String(item)
        acc[key] = (sosiVocab as any)?.[key]?.label || key
        return acc
    }, {} as Record<string, string>)
    const sosiTypeKeys = Object.keys(sosiTypes)
    const showSosi = sosiTypeKeys.length > 0


    if (!hit) return <div className="p-2">Det har oppstått ein feil: Kunne ikkje hente kjelder</div>

    return <div  {...rest} className={`w-full h-full aria-expanded:border-b aria-expanded:border-neutral-100 flex items-center group no-underline ${isInit ? 'pb-0' : ''}`}>

        <Clickable ref={itemRef}
            notClickable={notClickable}
            onClick={() => !notClickable && onClick?.()}
            remove={['doc', 'group', 'activePoint']}
            add={{ maxResults: SMALL_BASE_MAX_RESULTS, init: sourceView ? hit.fields.uuid[0] : stringToBase64Url(hit.fields["group.id"]?.[0]),
                point: hit.fields?.location?.[0]?.coordinates ? `${hit.fields?.location?.[0]?.coordinates[1]},${hit.fields?.location?.[0]?.coordinates[0]}` : null

            }}
            className="w-full text-left p-3">
            <div className="flex items-center justify-between gap-x-2 whitespace-normal w-full">
                <div className="inline-flex items-center flex-wrap gap-x-2 w-full">
                
                    {isGrunnord && (
                        <div className="inline-flex items-center gap-x-2 w-full">

                            <span className="font-semibold">
                                {label}
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
                        <span className="flex items-center gap-x-2">
                            { isInit && <img src="/currentLocation.svg" alt="" aria-hidden="true" className="h-6 mb-1 self-center " />}
                            <strong>{label}</strong> {otherLabel && <em className="text-neutral-700 text-sm whitespace-nowrap text-base">{otherLabel}</em>}
                        </span>
                    )}


                {sourceView && (
                        (docDataset || showSosi) && (
                            <span className="text-neutral-700 text-sm">
                                {docDataset && (
                                    <span>{datasetTitles[docDataset] || docDataset}</span>
                                )}
                                {docDataset && showSosi && (
                                    <span className="text-neutral-400 px-1">|</span>
                                )}
                                {showSosi && (
                                    <span>
                                        {sosiTypeKeys
                                            .slice(0, 3)
                                            .map((typeKey) => sosiTypes[typeKey])
                                            .join(", ")}
                                    </span>
                                )}
                            </span>
                        )
                    )}
                    
                        
                    
                </div>
                
                <DistanceBadge meters={hit.distance} />
            </div>
            <span className="text-sm text-neutral-700 inline-flex items-center gap-1 flex-wrap">
                            <AdmInfo hit={hit} />
                        </span>
            
            {hit.highlight && <>{formatHighlight(hit.highlight['content.html']?.[0] || hit.highlight['content.text']?.[0])}</>}
            
        </Clickable>



    </div>
}

