'use client'
import Clickable from '@/components/ui/clickable/clickable';
import { datasetTitles } from '@/config/metadata-config';
import { panPointIntoView } from '@/lib/map-utils';
import { useDrawerSnap, useInitDecoded, usePerspective, useSourceViewOn } from '@/lib/param-hooks';
import { stringToBase64Url } from '@/lib/param-utils';
import { formatHighlight } from '@/lib/text-utils';
import { GlobalContext } from '@/state/providers/global-provider';
import { useDebugStore } from '@/state/zustand/debug-store';
import { useNotificationStore } from '@/state/zustand/notification-store';
import { useSessionStore } from '@/state/zustand/session-store';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import DistanceBadge from '@/components/results/distance-badge';
import AdmInfo from '@/components/shared/adm-info';

export default function ResultItem({ hit, onClick, notClickable, ...rest }: { hit: any, onClick?: () => void, notClickable?: boolean } & Record<string, any>) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit?._index?.split('-')?.[2]
    const { isMobile, mapFunctionRef, sosiVocab } = useContext(GlobalContext)
    const snappedPosition = useDrawerSnap()
    const showScore = useDebugStore((s: any) => s.showScore)
    const setInitGroupLabel = useSessionStore((s) => s.setInitGroupLabel)
    const addNotification = useNotificationStore((s) => s.addNotification)
    const removeNotification = useNotificationStore((s) => s.removeNotification)
    const isGrunnord = docDataset?.includes('_g')

    const perspectiveIsGrunnord = perspective.includes('_g') || perspective == 'base'
    const initDecoded = useInitDecoded();
    const sourceViewOn = useSourceViewOn();
    const isInit = sourceViewOn ? initDecoded && initDecoded == hit.fields?.["uuid"]?.[0] : initDecoded && initDecoded == hit.fields?.["group.id"]?.[0]

    const label = (sourceViewOn || isGrunnord) ? hit.fields?.label?.[0] : hit.fields?.["group.label"]?.[0] || ''
    const otherLabel = !sourceViewOn && hit.fields?.label?.[0] != label ? hit.fields?.label?.[0] : null

    const rawSosi = hit.fields?.sosi
    const sosiArray = Array.isArray(rawSosi) ? rawSosi : rawSosi ? [rawSosi] : []
    const sosiTypes = sosiArray.reduce((acc: Record<string, string>, item: string) => {
        const key = String(item)
        acc[key] = (sosiVocab as any)?.[key]?.label || key
        return acc
    }, {} as Record<string, string>)
    const sosiTypeKeys = Object.keys(sosiTypes)
    const showSosi = sosiTypeKeys.length > 0


    useEffect(() => {
        if (!hit) {
            addNotification({
                id: "result-item-missing-hit",
                variant: "error",
                message: "Det har oppstått ein feil: Kunne ikkje hente kjelder"
            })
        } else {
            removeNotification("result-item-missing-hit")
        }
        return () => removeNotification("result-item-missing-hit")
    }, [addNotification, hit, removeNotification])

    if (!hit) return null

    const handleClick = () => {
        if (notClickable) return

        const coords = hit.fields?.location?.[0]?.coordinates
        if (coords && mapFunctionRef.current) {
            const lat = coords[1]
            const lng = coords[0]
            panPointIntoView(
                mapFunctionRef.current,
                [lat, lng],
                isMobile,
                isMobile ? snappedPosition === 'top' : undefined,
                true
            )
        }
        setInitGroupLabel(label, coords ? [coords[1], coords[0]] : null)

        onClick?.()
    }

    return <div  {...rest} className={`w-full h-full aria-expanded:border-b aria-expanded:border-neutral-100 flex items-center group no-underline ${isInit ? 'pb-0' : ''}`}>

        <Clickable ref={itemRef}
            notClickable={notClickable}
            onClick={handleClick}
            remove={['doc', 'activePoint', 'resultLimit']}
            add={{ init: sourceViewOn ? hit.fields.uuid[0] : stringToBase64Url(hit.fields["group.id"]?.[0]),
                point: hit.fields?.location?.[0]?.coordinates ? `${hit.fields?.location?.[0]?.coordinates[1]},${hit.fields?.location?.[0]?.coordinates[0]}` : null

            }}
            className="w-full text-left p-3">
            <div className="flex items-center justify-between gap-x-2 whitespace-normal w-full">
                <div className="inline-flex items-center flex-wrap gap-x-2 flex-1 min-w-0">
                
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
                        <span className="flex items-center gap-x-2 flex-wrap min-w-0">
                            { isInit && <img src="/currentLocation.svg" alt="" aria-hidden="true" className="h-6 mb-1 self-center " />}
                            <strong>{label}</strong> {otherLabel && <span className="text-neutral-700 text-sm text-base whitespace-normal break-words">{otherLabel}</span>}
                        </span>
                    )}


                {sourceViewOn && (
                        (docDataset || showSosi) && (
                            <span className="text-neutral-700 text-sm">
                                {docDataset && (
                                    <span>{datasetTitles[docDataset] || docDataset}</span>
                                )}
                                {docDataset && showSosi && (
                                    <span className="text-neutral-700 px-1">|</span>
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

