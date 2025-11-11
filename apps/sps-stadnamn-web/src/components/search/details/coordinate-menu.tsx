'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import DynamicClickable from "@/components/ui/clickable/dynamic-clickable";
import { datasetTitles } from "@/config/metadata-config";
import useDocData from "@/state/hooks/doc-data";
import { useContext, useId } from "react";
import { PiMapPinFill, PiMapPin } from "react-icons/pi";
import Link from 'next/link';
import CoordinateType from './doc/coordinate-type';
import { useRouter, useSearchParams } from "next/navigation";

function convertDMS(lat: number, lon: number): string {
    function toDMS(degree: number, direction: string[]): string {
        const absolute = Math.abs(degree);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = (minutesNotTruncated - minutes) * 60;
        return `${degrees}° ${minutes}′ ${seconds.toFixed(2)}″${degree >= 0 ? direction[0] : direction[1]}`;
    }
  
    const latitude = toDMS(lat, ['N', 'S']);
    const longitude = toDMS(lon, ['Ø', 'V']);
    return `${latitude} ${longitude}`;
}

export default function CoordinateMenu() {
    const { coordinateVocab, isMobile, mapFunctionRef } = useContext(GlobalContext)
    const { docData, docDataset } = useDocData()
    const id = useId();
    const popoverId = `coordinate-popover-${id}`;
    const anchorName = `--anchor-${id}`;
    const searchParams = useSearchParams()
    const router = useRouter()


    const coordinateType = docData?._source.coordinateType
    const coordinateMetadata = coordinateVocab[coordinateType]
    const isOriginal = !coordinateType || (docDataset && ["ssr2016"].includes(docDataset)) || coordinateMetadata?.creator === "ssr"
    
    const handleFlyTo = () => {
        const lat = docData._source.location.coordinates[1];
        const lng = docData._source.location.coordinates[0];
        const newUrl = new URLSearchParams(searchParams)
        newUrl.set('center', `${lat},${lng}`)
        newUrl.set('zoom', '15')
        router.push(`?${newUrl.toString()}`)
        
        mapFunctionRef.current?.flyTo([lat, lng], 15);
    }

    return docData?._source.location ? (
        <>
            <DynamicClickable 
                onClick={handleFlyTo}
                popoverTarget={popoverId}
                style={{ ['anchorName' as any]: anchorName }}
                className={`btn btn-outline btn-compact flex items-center gap-2 h-10 min-w-0 shrink`}>
                <div className="flex items-center gap-2 min-w-0">
                    <PiMapPinFill className="text-lg text-neutral-600 flex-shrink-0" aria-hidden="true"/>
                    {!isMobile && <span className="text-sm truncate block min-w-0">{docData._source.coordinateType ? coordinateVocab[docData._source.coordinateType]?.creator : datasetTitles[docDataset as string]}{!isOriginal && <span className="text-neutral-800"> (berika)</span>}</span>}
                </div>
            </DynamicClickable>
            
            <div
                id={popoverId}
                popover="auto"
                // @ts-expect-error: anchor is not yet in React's type definitions
                anchor={anchorName}
                className="absolute p-4 rounded-md shadow-md bg-white border border-neutral-200 text-base max-w-[100svw] max-h-[30svh] overflow-auto"
                style={{
                    top: "auto",
                    left:  "50%",
                    right: "1rem",
                    bottom: "2rem",
                    transform: "translateX(-50%)",
                    marginTop: "0",
                    maxWidth: "calc(100vw - 2rem)",
                }}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="my-2 pb-8">
                <h2 className="text-lg font-bold">{docData._source.coordinateType ? coordinateVocab[docData._source.coordinateType].label : "Uspesifisert koordinattype"}</h2>
                
                    <div className="flex items-center space-x-2">
                        
                        <Link className="font-semibold" 
                            href={`https://geohack.toolforge.org/geohack.php?pagename=Geohack&params=${docData._source.location.coordinates[1]};${docData._source.location.coordinates[0]}&language=no`}>
                            {convertDMS(docData._source.location.coordinates[1], docData._source.location.coordinates[0])}
                        </Link>
                    </div>
                    <p>{docData._source.coordinateType ? coordinateVocab[docData._source.coordinateType].definition : "Uspesifisert koordinattype"}</p>

                </div>
            </div>
        </>
    ) : <em className="text-sm text-neutral-500 flex items-center gap-2 p-2">
        {docData?._source.location ? "Utan koordinattype" : "Utan koordinater"}
    </em>
}
