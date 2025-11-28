'use client'
import { baseMapLookup } from "@/config/basemap-config";
import dynamic from 'next/dynamic';
import { getUnlabeledMarker } from "./markers";

const DynamicMap = dynamic(() => import('./leaflet/dynamic-map'), {
    ssr: false
});

interface EmbeddedMapProps {
    coordinate: [number, number]; // [lat, lng]
    zoom?: number;
    className?: string;
}

export default function EmbeddedMap({
    coordinate,
    zoom = 10,
    className = "",
}: EmbeddedMapProps) {
    return (
        <div className={`w-full ${className}`} style={{ height: '14rem', width: '18.75rem' }}>
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
                {({ TileLayer, Marker, AttributionControl }: any, leaflet: any) => {
                    // Use a simple base map
                    const baseMap = baseMapLookup['world_map'];

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
                            <Marker
                                position={coordinate}
                                icon={new leaflet.DivIcon(getUnlabeledMarker("primary"))}
                            />
                        </>
                    );
                }}
            </DynamicMap>
        </div>
    );
}