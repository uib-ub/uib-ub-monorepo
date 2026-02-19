'use client'

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { getUnlabeledMarker } from './markers';

type LatLng = [number, number];
type Bounds = [[number, number], [number, number]];

type BaseMap = {
  props: {
    url: string;
    attribution: string;
  };
  opacity?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
  wms?: {
    layers: string;
    format?: string;
    transparent?: boolean;
    version?: string;
  };
};

type ResultMarker = {
  id: string;
  position: LatLng;
  html: string;
  anchor?: 'center' | 'bottom' | 'top' | 'left' | 'right';
  onClick?: () => void;
};

const toLngLat = ([lat, lng]: LatLng): [number, number] => [lng, lat];

const expandSubdomains = (url: string): string[] => {
  const normalized = url.replaceAll('{r}', '');
  if (!normalized.includes('{s}')) return [normalized];
  return ['a', 'b', 'c', 'd'].map((s) => normalized.replaceAll('{s}', s));
};

const buildWmsTileUrl = ({
  url,
  layers,
  format = 'image/png',
  transparent = true,
  version = '1.3.0',
}: {
  url: string;
  layers: string;
  format?: string;
  transparent?: boolean;
  version?: string;
}) => {
  const delimiter = url.includes('?') ? (url.endsWith('?') || url.endsWith('&') ? '' : '&') : '?';
  const crsPart = version.startsWith('1.3') ? 'crs=EPSG%3A3857' : 'srs=EPSG%3A3857';
  return `${url}${delimiter}service=WMS&request=GetMap&layers=${encodeURIComponent(layers)}&styles=&format=${encodeURIComponent(format)}&transparent=${transparent}&version=${encodeURIComponent(version)}&width=256&height=256&${crsPart}&bbox={bbox-epsg-3857}`;
};

const buildStyle = (
  baseMapKey: string,
  overlayMapKeys: string[],
  baseMapLookup: Record<string, BaseMap>
) => {
  const sources: Record<string, any> = {};
  const layers: any[] = [];

  const base = baseMapLookup[baseMapKey];
  if (base?.props?.url) {
    sources['base-map'] = {
      type: 'raster',
      tiles: expandSubdomains(base.props.url),
      tileSize: 256,
      attribution: base.props.attribution,
      maxzoom: base.maxNativeZoom ?? base.maxZoom ?? 22,
    };
    layers.push({
      id: 'base-map',
      type: 'raster',
      source: 'base-map',
      paint: { 'raster-opacity': base.opacity ?? 1 },
    });
  }

  (overlayMapKeys || []).slice(0, 5).forEach((overlayKey, index) => {
    const overlay = baseMapLookup[overlayKey];
    if (!overlay) return;
    const id = `overlay-map-${index}`;
    sources[id] = overlay.wms
      ? {
          type: 'raster',
          tiles: [
            buildWmsTileUrl({
              url: overlay.props.url,
              layers: overlay.wms.layers,
              format: overlay.wms.format,
              transparent: overlay.wms.transparent,
              version: overlay.wms.version,
            }),
          ],
          tileSize: 256,
          attribution: overlay.props.attribution,
        }
      : {
          type: 'raster',
          tiles: expandSubdomains(overlay.props.url),
          tileSize: 256,
          attribution: overlay.props.attribution,
          maxzoom: overlay.maxNativeZoom ?? overlay.maxZoom ?? 22,
        };
    layers.push({
      id,
      type: 'raster',
      source: id,
      paint: { 'raster-opacity': overlay.opacity ?? 1 },
    });
  });

  if (!layers.length) {
    layers.push({
      id: 'fallback-bg',
      type: 'background',
      paint: { 'background-color': '#f4f4f5' },
    });
  }

  return { version: 8, sources, layers } as any;
};

const safeRemoveMap = (map: maplibregl.Map | null) => {
  if (!map) return;
  try {
    map.remove();
  } catch {
    // ignore dev strict-mode double cleanup
  }
};

export default function MaplibreDirectMap({
  center,
  zoom,
  className,
  style,
  baseMapKey,
  overlayMapKeys,
  baseMapLookup,
  point,
  activePoint,
  resultMarkers,
  onMoveEnd,
  onContextMenu,
  mapRef,
  enable3D = true,
  initialBearing = 0,
  initialPitch = 0,
}: {
  center: LatLng;
  zoom: number;
  className?: string;
  style?: React.CSSProperties;
  baseMapKey: string;
  overlayMapKeys: string[];
  baseMapLookup: Record<string, BaseMap>;
  point?: LatLng | null;
  activePoint?: LatLng | null;
  resultMarkers?: ResultMarker[];
  onMoveEnd?: (payload: { bounds: Bounds; center: LatLng; zoom: number; bearing: number; pitch: number }) => void;
  onContextMenu?: (point: LatLng) => void;
  mapRef?: React.MutableRefObject<any>;
  enable3D?: boolean;
  initialBearing?: number;
  initialPitch?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInternalRef = useRef<maplibregl.Map | null>(null);
  const pointMarkerRef = useRef<maplibregl.Marker | null>(null);
  const activePointMarkerRef = useRef<maplibregl.Marker | null>(null);
  const resultMarkerRefs = useRef<maplibregl.Marker[]>([]);
  const onMoveEndRef = useRef(onMoveEnd);
  const onContextMenuRef = useRef(onContextMenu);

  onMoveEndRef.current = onMoveEnd;
  onContextMenuRef.current = onContextMenu;

  useEffect(() => {
    if (!containerRef.current || mapInternalRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(baseMapKey, overlayMapKeys, baseMapLookup),
      center: toLngLat(center),
      zoom,
      attributionControl: {},
      dragRotate: enable3D,
      touchPitch: enable3D,
      bearing: initialBearing,
      pitch: initialPitch,
    });

    map.on('contextmenu', (event) => {
      onContextMenuRef.current?.([event.lngLat.lat, event.lngLat.lng]);
    });
    map.on('moveend', () => {
      const b = map.getBounds();
      const c = map.getCenter();
      onMoveEndRef.current?.({
        bounds: [[b.getNorth(), b.getWest()], [b.getSouth(), b.getEast()]],
        center: [c.lat, c.lng],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    });

    if (mapRef) {
      mapRef.current = {
        _map: map,
        getBounds: () => map.getBounds(),
        getZoom: () => map.getZoom(),
        setView: (latlng: LatLng, z?: number) =>
          map.easeTo({
            center: toLngLat(latlng),
            zoom: typeof z === 'number' ? z : map.getZoom(),
            duration: 0,
          }),
        flyTo: (latlng: LatLng, z?: number, options?: any) =>
          map.flyTo({
            center: toLngLat(latlng),
            zoom: typeof z === 'number' ? z : map.getZoom(),
            duration: 800,
            essential: true,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            ...(options || {}),
          }),
        fitBounds: (bounds: Bounds, options?: any) =>
          map.fitBounds(
            [[bounds[0][1], bounds[1][0]], [bounds[1][1], bounds[0][0]]],
            {
              duration: 800,
              essential: true,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
              ...(options || {}),
            },
          ),
      };
    }

    mapInternalRef.current = map;
    return () => {
      pointMarkerRef.current?.remove();
      activePointMarkerRef.current?.remove();
      resultMarkerRefs.current.forEach((marker) => marker.remove());
      resultMarkerRefs.current = [];
      if (mapRef) mapRef.current = null;
      safeRemoveMap(map);
      mapInternalRef.current = null;
    };
    // init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInternalRef.current;
    if (!map) return;
    if (enable3D) {
      if ((map as any).dragRotate?.enable) (map as any).dragRotate.enable();
      if ((map as any).touchZoomRotate?.enableRotation) (map as any).touchZoomRotate.enableRotation();
      const c = map.getCenter();
      const z = map.getZoom();
      map.easeTo({
        center: c,
        zoom: z,
        bearing: initialBearing,
        pitch: initialPitch || 60,
        duration: 1200,
        essential: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      if ((map as any).dragRotate?.disable) (map as any).dragRotate.disable();
      if ((map as any).touchZoomRotate?.disableRotation) (map as any).touchZoomRotate.disableRotation();
      const c = map.getCenter();
      const z = map.getZoom();
      map.easeTo({
        center: c,
        zoom: z,
        bearing: 0,
        pitch: 0,
        duration: 1200,
        essential: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }
  }, [enable3D, initialBearing, initialPitch]);

  useEffect(() => {
    const map = mapInternalRef.current;
    if (!map) return;
    map.setStyle(buildStyle(baseMapKey, overlayMapKeys, baseMapLookup));
  }, [baseMapKey, overlayMapKeys, baseMapLookup]);

  useEffect(() => {
    const map = mapInternalRef.current;
    if (!map) return;
    pointMarkerRef.current?.remove();
    pointMarkerRef.current = null;
    if (!point) return;
    const element = document.createElement('div');
    element.innerHTML = getUnlabeledMarker('primary').html;
    pointMarkerRef.current = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat(toLngLat(point))
      .addTo(map);
  }, [point]);

  useEffect(() => {
    const map = mapInternalRef.current;
    if (!map) return;
    activePointMarkerRef.current?.remove();
    activePointMarkerRef.current = null;
    if (!activePoint) return;
    const element = document.createElement('div');
    element.innerHTML = getUnlabeledMarker('accent').html;
    activePointMarkerRef.current = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat(toLngLat(activePoint))
      .addTo(map);
  }, [activePoint]);

  useEffect(() => {
    const map = mapInternalRef.current;
    if (!map) return;

    resultMarkerRefs.current.forEach((marker) => marker.remove());
    resultMarkerRefs.current = [];

    (resultMarkers || []).forEach((markerDef) => {
      const element = document.createElement('div');
      element.innerHTML = markerDef.html;
      if (markerDef.onClick) {
        element.style.cursor = 'pointer';
        element.addEventListener('click', markerDef.onClick);
        element.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            markerDef.onClick?.();
          }
        });
      }
      const marker = new maplibregl.Marker({
        element,
        anchor: markerDef.anchor ?? 'center',
      })
        .setLngLat(toLngLat(markerDef.position))
        .addTo(map);
      resultMarkerRefs.current.push(marker);
    });
  }, [resultMarkers]);

  return <div ref={containerRef} className={className} style={style} />;
}
