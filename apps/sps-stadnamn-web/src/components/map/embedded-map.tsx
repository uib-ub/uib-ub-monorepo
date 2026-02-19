'use client'
import { baseMapLookup } from "@/config/basemap-config";
import { baseLayerKeys } from "@/config/basemap-config";
import { defaultMaxResultsParam } from "@/config/max-results";
import { getUnlabeledMarker } from "./markers";
import { stringToBase64Url } from "@/lib/param-utils";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const storedBaseMap = useMapSettings((state) => state.baseMap);
    const selectedBaseMapKey = storedBaseMap && baseLayerKeys.includes(storedBaseMap)
        ? storedBaseMap
        : 'standard';
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

    useEffect(() => {
        const container = mapContainerRef.current;
        if (!container || mapRef.current) return;

        const map = new maplibregl.Map({
            container,
            style: {
                version: 8,
                sources: {},
                layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f4f4f5' } }],
            } as any,
            center: [coordinate[1], coordinate[0]],
            zoom,
            attributionControl: {},
            interactive: false,
        });
        mapRef.current = map;

        map.on('load', () => {
            const baseMap = baseMapLookup[selectedBaseMapKey] || baseMapLookup['standard'];
            if (baseMap?.props?.url) {
                const url = baseMap.props.url.replaceAll('{r}', '');
                const tiles = url.includes('{s}')
                    ? ['a', 'b', 'c', 'd'].map((s) => url.replaceAll('{s}', s))
                    : [url];
                map.addSource('embedded-base', {
                    type: 'raster',
                    tiles,
                    tileSize: 256,
                    attribution: baseMap.props.attribution,
                    maxzoom: baseMap.maxNativeZoom ?? baseMap.maxZoom ?? 22,
                } as any);
                map.addLayer({
                    id: 'embedded-base',
                    type: 'raster',
                    source: 'embedded-base',
                } as any);
            }
            const visibleMarkerHtml = getUnlabeledMarker("primary").html
                .replace('role="button"', 'aria-hidden="true"')
                .replace('tabindex="0"', '');
            const markerEl = document.createElement('div');
            markerEl.innerHTML = visibleMarkerHtml;
            markerRef.current = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
                .setLngLat([coordinate[1], coordinate[0]])
                .addTo(map);
        });

        return () => {
            markerRef.current?.remove();
            markerRef.current = null;
            try {
                map.remove();
            } catch {
                // no-op
            }
            mapRef.current = null;
        };
    }, [coordinate, selectedBaseMapKey, zoom]);
    //const coordinate = [source.location.coordinates[1], source.location.coordinates[0]]
    return (
        <div
            className={`relative w-full cursor-pointer ${className}`}
            style={{ height: '14rem', width: '18.75rem' }}
            role="button"
            tabIndex={0}
            aria-label="Open search at this map location"
            onClick={handleMapClick}
            onKeyDown={handleMapKeyDown}
        >
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}