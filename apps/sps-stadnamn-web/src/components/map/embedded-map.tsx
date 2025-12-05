'use client'
import { baseMapLookup } from "@/config/basemap-config";
import dynamic from 'next/dynamic';
import { getUnlabeledMarker } from "./markers";
import { stringToBase64Url } from "@/lib/param-utils";
import { useRouter } from "next/navigation";

const DynamicMap = dynamic(() => import('./leaflet/dynamic-map'), {
    ssr: false
});

interface EmbeddedMapProps {
    coordinate: [number, number];
    zoom?: number;
    className?: string;
    source: Record<string, any>;
}

export default function EmbeddedMap({
    coordinate,
    zoom = 10,
    className = "",
    source,
}: EmbeddedMapProps) {
    const router = useRouter();
    //const coordinate = [source.location.coordinates[1], source.location.coordinates[0]]
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
                                eventHandlers={{
                                    click: () => {
                                        const newParams = new URLSearchParams();
                                        newParams.set('init', stringToBase64Url(source?.group?.id));
                                        newParams.set('maxResults', '1');
                                        newParams.set('activePoint', `${coordinate[0]},${coordinate[1]}`);
                                        router.push(`/search?${newParams.toString()}`);
                                    }
                                }}
                            />
                        </>
                    );
                }}
            </DynamicMap>
        </div>
    );
}