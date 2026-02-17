'use client'
import { baseMapLookup } from "@/config/basemap-config";
import { defaultMaxResultsParam } from "@/config/max-results";
import dynamic from 'next/dynamic';
import { getUnlabeledMarker } from "./markers";
import { stringToBase64Url } from "@/lib/param-utils";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";

const DynamicMap = dynamic(() => import('./leaflet/dynamic-map'), {
    ssr: false
});

interface EmbeddedMapProps {
    coordinate: [number, number];
    zoom?: number;
    className?: string;
    source: Record<string, any>;
    usePointQuery?: boolean;
}

export default function EmbeddedMap({
    coordinate,
    zoom = 10,
    className = "",
    source,
    usePointQuery = false,
}: EmbeddedMapProps) {
    const router = useRouter();
    const storedBaseMap = useMapSettings((state) => state.baseMap);
    const datasetPerspective = typeof source?.dataset === 'string' ? source.dataset : '';
    const selectedBaseMapKey = datasetPerspective && baseMapLookup[storedBaseMap?.[datasetPerspective]]
        ? storedBaseMap[datasetPerspective]
        : (storedBaseMap?.all && baseMapLookup[storedBaseMap.all] ? storedBaseMap.all : 'world_map');
    const handleMapClick = () => {
        const newParams = new URLSearchParams();
        if (usePointQuery) {
            if (typeof source?.label === 'string' && source.label.length > 0) {
                newParams.set('q', source.label);
            }
            newParams.set('point', `${coordinate[0]},${coordinate[1]}`);
            newParams.set('maxResults', defaultMaxResultsParam);
        } else {
            newParams.set('init', stringToBase64Url(source?.group?.id));
            newParams.set('maxResults', defaultMaxResultsParam);
            newParams.set('activePoint', `${coordinate[0]},${coordinate[1]}`);
        }
        router.push(`/search?${newParams.toString()}`);
    };
    const handleMapKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        handleMapClick();
    };
    //const coordinate = [source.location.coordinates[1], source.location.coordinates[0]]
    return (
        <div
            className={`relative w-full cursor-pointer ${className}`}
            style={{ height: '14rem', width: '18.75rem' }}
            role="button"
            tabIndex={0}
            aria-label="Open search at this map location"
            onKeyDown={handleMapKeyDown}
        >
            <DynamicMap
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                boxZoom={false}
                keyboard={false}
                zoom={zoom}
                center={coordinate}
                className="w-full h-full"
            >
                {({ TileLayer, Rectangle, Marker, AttributionControl }: any, leaflet: any) => {
                    // Use a simple base map
                    const baseMap = baseMapLookup[selectedBaseMapKey] || baseMapLookup['world_map'];
                    const visibleMarkerHtml = getUnlabeledMarker("primary").html
                        .replace('role="button"', 'aria-hidden="true"')
                        .replace('tabindex="0"', '');

                    return (
                        <>
                            <AttributionControl prefix={false} position="bottomright" />
                            {baseMap && (
                                <TileLayer
                                    maxZoom={18}
                                    maxNativeZoom={18}
                                    {...baseMap.props}
                                />
                            )}
                            <Rectangle
                                bounds={[[-90, -180], [90, 180]]}
                                pathOptions={{
                                    fillOpacity: 0,
                                    opacity: 0
                                }}
                                eventHandlers={{
                                    click: handleMapClick
                                }}
                            />
                            <Marker
                                position={coordinate}
                                icon={new leaflet.DivIcon({
                                    className: '',
                                    html: visibleMarkerHtml
                                })}
                                interactive={false}
                                keyboard={false}
                            />
                        </>
                    );
                }}
            </DynamicMap>
        </div>
    );
}