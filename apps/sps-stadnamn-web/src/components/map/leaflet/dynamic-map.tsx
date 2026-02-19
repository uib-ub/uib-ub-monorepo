'use client'

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';

type LatLng = [number, number];
type Bounds = [[number, number], [number, number]];

const MapContext = (globalThis as any).__MAPLIBRE_LEAFLET_CONTEXT__ || { current: null as any };
(globalThis as any).__MAPLIBRE_LEAFLET_CONTEXT__ = MapContext;

const toLngLat = ([lat, lng]: LatLng): [number, number] => [lng, lat];
const fromLngLat = ({ lng, lat }: { lng: number, lat: number }): LatLng => [lat, lng];
const toMapLibreBounds = (bounds: Bounds): [[number, number], [number, number]] => {
  const [[north, west], [south, east]] = bounds;
  return [[west, south], [east, north]];
};

const toMapLibreDuration = (durationSeconds?: number) =>
  typeof durationSeconds === 'number' ? durationSeconds * 1000 : undefined;

const normalizeMapEvent = (event: any) => {
  const latlng = event?.lngLat ? { lat: event.lngLat.lat, lng: event.lngLat.lng } : undefined;
  return {
    ...event,
    latlng,
    originalEvent: event?.originalEvent ?? event,
  };
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
  const crsPart = version.startsWith('1.3')
    ? 'crs=EPSG%3A3857'
    : 'srs=EPSG%3A3857';
  return `${url}${delimiter}service=WMS&request=GetMap&layers=${encodeURIComponent(layers)}&styles=&format=${encodeURIComponent(format)}&transparent=${transparent}&version=${encodeURIComponent(version)}&width=256&height=256&${crsPart}&bbox={bbox-epsg-3857}`;
};

const expandSubdomains = (url: string): string[] => {
  const normalized = url.replaceAll('{r}', '');
  if (!normalized.includes('{s}')) return [normalized];
  return ['a', 'b', 'c', 'd'].map((subdomain) => normalized.replaceAll('{s}', subdomain));
};

let idCounter = 0;
const useStableId = (prefix: string) => {
  const ref = useRef<string>('');
  if (!ref.current) {
    idCounter += 1;
    ref.current = `${prefix}-${idCounter}`;
  }
  return ref.current;
};

const getContext = () => {
  if (!MapContext.current) throw new Error('Map context not ready');
  return MapContext.current;
};

const useMap = () => {
  return getContext().adapter;
};

const useMapEvents = (eventHandlers: Record<string, (...args: any[]) => void>) => {
  const map = getContext().map as maplibregl.Map | null;
  useEffect(() => {
    if (!map) return;
    const subscriptions = Object.entries(eventHandlers || {}).map(([eventName, handler]) => {
      const wrapped = (event: any) => handler(normalizeMapEvent(event));
      map.on(eventName as any, wrapped);
      return { eventName, wrapped };
    });
    return () => {
      subscriptions.forEach(({ eventName, wrapped }) => map.off(eventName as any, wrapped));
    };
  }, [map, eventHandlers]);
  return null;
};

const runWhenStyleReady = (map: maplibregl.Map, cb: () => void) => {
  if (map.isStyleLoaded()) {
    cb();
    return () => {};
  }
  const handler = () => {
    if (!map.isStyleLoaded()) return;
    map.off('styledata', handler);
    cb();
  };
  map.on('styledata', handler);
  return () => {
    map.off('styledata', handler);
  };
};

const TileLayer = ({ url, attribution, opacity = 1, maxZoom, maxNativeZoom }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('tile-source');
  const layerId = useStableId('tile-layer');

  useEffect(() => {
    if (!map || !url) return;
    const add = () => {
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, {
        type: 'raster',
        tiles: expandSubdomains(url),
        tileSize: 256,
        attribution,
        maxzoom: maxNativeZoom ?? maxZoom ?? 22,
      } as any);
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': opacity,
        },
      } as any);
      if (typeof maxZoom === 'number') {
        map.setLayerZoomRange(layerId, 0, maxZoom);
      }
    };

    const disposeStyleListener = runWhenStyleReady(map, add);

    return () => {
      disposeStyleListener();
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, url, attribution, opacity, maxZoom, maxNativeZoom, layerId, sourceId]);

  return null;
};

const WMSTileLayer = ({ url, layers, format, transparent, version, attribution, opacity = 1 }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('wms-source');
  const layerId = useStableId('wms-layer');

  useEffect(() => {
    if (!map || !url || !layers) return;
    const add = () => {
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [buildWmsTileUrl({ url, layers, format, transparent, version })],
        tileSize: 256,
        attribution,
      } as any);
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': opacity,
        },
      } as any);
    };

    const disposeStyleListener = runWhenStyleReady(map, add);

    return () => {
      disposeStyleListener();
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, url, layers, format, transparent, version, attribution, opacity, layerId, sourceId]);

  return null;
};

const Marker = ({ position, icon, zIndexOffset, eventHandlers = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || !position) return;
    const element = document.createElement('div');
    const className = icon?.options?.className;
    if (className) element.className = className;
    if (icon?.options?.html) element.innerHTML = icon.options.html;
    if (typeof zIndexOffset === 'number') element.style.zIndex = `${zIndexOffset}`;

    if (eventHandlers.click) {
      element.addEventListener('click', (event) => {
        eventHandlers.click({ originalEvent: event });
      });
    }
    if (eventHandlers.keydown) {
      element.addEventListener('keydown', (event) => {
        eventHandlers.keydown({ originalEvent: event, key: (event as KeyboardEvent).key });
      });
    }

    markerRef.current = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat(toLngLat(position))
      .addTo(map);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [map, position, icon, zIndexOffset, eventHandlers]);

  return null;
};

const Rectangle = ({ bounds, pathOptions = {}, eventHandlers = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('rectangle-source');
  const lineLayerId = useStableId('rectangle-line');
  const fillLayerId = useStableId('rectangle-fill');

  useEffect(() => {
    if (!map || !bounds) return;
    const [[north, west], [south, east]] = bounds as Bounds;
    const coordinates = [[west, north], [east, north], [east, south], [west, south], [west, north]];
    const feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coordinates] },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': pathOptions.color ?? '#3388ff',
          'fill-opacity': pathOptions.fillOpacity ?? 0.2,
        },
      } as any);
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': pathOptions.color ?? '#3388ff',
          'line-width': pathOptions.weight ?? 2,
          'line-opacity': pathOptions.opacity ?? 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    const clickHandler = (event: any) => eventHandlers.click?.(normalizeMapEvent(event));
    if (eventHandlers.click) map.on('click', fillLayerId, clickHandler);

    return () => {
      if (eventHandlers.click) map.off('click', fillLayerId, clickHandler);
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, bounds, pathOptions, eventHandlers, sourceId, lineLayerId, fillLayerId]);

  return null;
};

const Polyline = ({ positions, pathOptions = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('polyline-source');
  const layerId = useStableId('polyline-layer');

  useEffect(() => {
    if (!map || !positions?.length) return;
    const feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: positions.map(toLngLat) },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': pathOptions.color ?? '#3388ff',
          'line-width': pathOptions.weight ?? 2,
          'line-opacity': pathOptions.opacity ?? 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    return () => {
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, positions, pathOptions, layerId, sourceId]);

  return null;
};

const Polygon = ({ positions, pathOptions = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('polygon-source');
  const lineLayerId = useStableId('polygon-line');
  const fillLayerId = useStableId('polygon-fill');

  useEffect(() => {
    if (!map || !positions?.length) return;
    const feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [positions.map(toLngLat)] },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': pathOptions.color ?? '#3388ff',
          'fill-opacity': pathOptions.fillOpacity ?? 0.2,
        },
      } as any);
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': pathOptions.color ?? '#3388ff',
          'line-width': pathOptions.weight ?? 2,
          'line-opacity': pathOptions.opacity ?? 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    return () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, positions, pathOptions, sourceId, lineLayerId, fillLayerId]);

  return null;
};

const MultiPolygon = ({ positions, pathOptions = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('multipolygon-source');
  const lineLayerId = useStableId('multipolygon-line');
  const fillLayerId = useStableId('multipolygon-fill');

  useEffect(() => {
    if (!map || !positions?.length) return;
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: positions.map((polygon: any) => polygon.map((ring: any) => ring.map(toLngLat))),
      },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': pathOptions.color ?? '#3388ff',
          'fill-opacity': pathOptions.fillOpacity ?? 0.2,
        },
      } as any);
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': pathOptions.color ?? '#3388ff',
          'line-width': pathOptions.weight ?? 2,
          'line-opacity': pathOptions.opacity ?? 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    return () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, positions, pathOptions, sourceId, lineLayerId, fillLayerId]);

  return null;
};

const CircleMarker = ({ center, radius = 6, pathOptions = {}, color, weight, opacity, fillOpacity, eventHandlers = {} }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('circlemarker-source');
  const layerId = useStableId('circlemarker-layer');

  useEffect(() => {
    if (!map || !center) return;
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: toLngLat(center) },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': radius,
          'circle-color': pathOptions.fillColor ?? color ?? pathOptions.color ?? '#3388ff',
          'circle-opacity': pathOptions.fillOpacity ?? fillOpacity ?? 0.2,
          'circle-stroke-color': pathOptions.color ?? color ?? '#3388ff',
          'circle-stroke-width': pathOptions.weight ?? weight ?? 2,
          'circle-stroke-opacity': pathOptions.opacity ?? opacity ?? 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    const clickHandler = (event: any) => eventHandlers.click?.(normalizeMapEvent(event));
    if (eventHandlers.click) map.on('click', layerId, clickHandler);

    return () => {
      if (eventHandlers.click) map.off('click', layerId, clickHandler);
      if (map?.getLayer?.(layerId)) map.removeLayer(layerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, center, radius, pathOptions, color, weight, opacity, fillOpacity, eventHandlers, sourceId, layerId]);

  return null;
};

const toCirclePolygon = (center: LatLng, radiusMeters: number, points = 64): [number, number][][] => {
  const [lat, lng] = center;
  const earthRadius = 6378137;
  const d = radiusMeters / earthRadius;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const ring: [number, number][] = [];
  for (let i = 0; i <= points; i += 1) {
    const bearing = (i / points) * 2 * Math.PI;
    const lat2 = Math.asin(Math.sin(latRad) * Math.cos(d) + Math.cos(latRad) * Math.sin(d) * Math.cos(bearing));
    const lng2 = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(lat2)
    );
    ring.push([lng2 * 180 / Math.PI, lat2 * 180 / Math.PI]);
  }
  return [ring];
};

const Circle = ({ center, radius = 0, color = '#3388ff' }: any) => {
  const map = getContext().map as maplibregl.Map | null;
  const sourceId = useStableId('circle-source');
  const lineLayerId = useStableId('circle-line');
  const fillLayerId = useStableId('circle-fill');

  useEffect(() => {
    if (!map || !center || !radius) return;
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: toCirclePolygon(center, radius),
      },
      properties: {},
    } as any;

    const add = () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
      map.addSource(sourceId, { type: 'geojson', data: feature } as any);
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.1,
        },
      } as any);
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': 1,
        },
      } as any);
    };

    if (map.isStyleLoaded()) add();
    else map?.once?.('load', add);

    return () => {
      if (map?.getLayer?.(fillLayerId)) map.removeLayer(fillLayerId);
      if (map?.getLayer?.(lineLayerId)) map.removeLayer(lineLayerId);
      if (map?.getSource?.(sourceId)) map.removeSource(sourceId);
    };
  }, [map, center, radius, color, sourceId, lineLayerId, fillLayerId]);

  return null;
};

const AttributionControl = ({ position = 'bottomright' }: any) => {
  const ctx = getContext();
  const map = ctx.map as maplibregl.Map | null;

  useEffect(() => {
    if (!map) return;
    const control = new maplibregl.AttributionControl();
    const pos = String(position).replace('bottomright', 'bottom-right').replace('bottomleft', 'bottom-left').replace('topright', 'top-right').replace('topleft', 'top-left') as maplibregl.ControlPosition;
    map.addControl(control, pos);
    ctx.attributionControl = {
      getContainer: () => map.getContainer().querySelector('.maplibregl-ctrl-attrib') as HTMLElement,
    };
    ctx.adapter.attributionControl = ctx.attributionControl;
    return () => {
      try {
        map.removeControl(control);
      } catch {
        // removeControl can throw during strict-mode double cleanup
      }
      ctx.attributionControl = null;
      ctx.adapter.attributionControl = null;
    };
  }, [map, ctx, position]);

  return null;
};

const Popup = () => null;
const Tooltip = () => null;

class DivIcon {
  options: any;
  constructor(options: any) {
    this.options = options || {};
  }
}

const DynamicMap = ({ children, mapRef, whenReady, center, zoom, className, style, ...rest }: any) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRefInternal = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const adapterRef = useRef<any>(null);
  if (!adapterRef.current) {
    adapterRef.current = {};
  }

  useEffect(() => {
    if (!containerRef.current || mapRefInternal.current) return;

    const mapOptions: any = { ...rest };
    if ('dragging' in mapOptions) {
      mapOptions.dragPan = !!mapOptions.dragging;
      delete mapOptions.dragging;
    }
    if ('scrollWheelZoom' in mapOptions) {
      mapOptions.scrollZoom = !!mapOptions.scrollWheelZoom;
      delete mapOptions.scrollWheelZoom;
    }
    if ('touchZoom' in mapOptions) {
      mapOptions.touchZoomRotate = !!mapOptions.touchZoom;
      delete mapOptions.touchZoom;
    }
    if ('zoomControl' in mapOptions) delete mapOptions.zoomControl;
    if ('tapHold' in mapOptions) delete mapOptions.tapHold;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'adapter-background',
            type: 'background',
            paint: {
              'background-color': '#f4f4f5',
            },
          },
        ],
      } as any,
      center: center ? toLngLat(center) : toLngLat([62, 16]),
      zoom: typeof zoom === 'number' ? zoom : 5,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
      ...mapOptions,
    });

    // Guard style lifecycle races during React unmount/HMR:
    // MapLibre methods can throw after map.remove() when style is already torn down.
    const originalGetLayer = map.getLayer.bind(map);
    const originalGetSource = map.getSource.bind(map);
    const originalRemoveLayer = map.removeLayer.bind(map);
    const originalRemoveSource = map.removeSource.bind(map);
    (map as any).getLayer = (id: string) => {
      try {
        return originalGetLayer(id);
      } catch {
        return undefined;
      }
    };
    (map as any).getSource = (id: string) => {
      try {
        return originalGetSource(id);
      } catch {
        return undefined;
      }
    };
    (map as any).removeLayer = (id: string) => {
      try {
        return originalRemoveLayer(id);
      } catch {
        return map;
      }
    };
    (map as any).removeSource = (id: string) => {
      try {
        return originalRemoveSource(id);
      } catch {
        return map;
      }
    };

    mapRefInternal.current = map;

    const adapter = adapterRef.current;
    adapter._map = map;
    adapter.getZoom = () => map.getZoom();
    adapter.getMaxZoom = () => map.getMaxZoom();
    adapter.getSize = () => ({ x: map.getContainer().clientWidth, y: map.getContainer().clientHeight });
    adapter.getBounds = () => {
      const b = map.getBounds();
      return {
        getNorth: () => b.getNorth(),
        getSouth: () => b.getSouth(),
        getWest: () => b.getWest(),
        getEast: () => b.getEast(),
        getCenter: () => {
          const c = b.getCenter();
          return { lat: c.lat, lng: c.lng };
        },
        contains: ([lat, lng]: LatLng) => {
          return lat <= b.getNorth() && lat >= b.getSouth() && lng >= b.getWest() && lng <= b.getEast();
        },
      };
    };
    adapter.fitBounds = (bounds: Bounds, options?: any) => {
      map.fitBounds(toMapLibreBounds(bounds), {
        maxZoom: options?.maxZoom,
        padding: options?.padding,
        duration: toMapLibreDuration(options?.duration),
      } as any);
    };
    adapter.flyToBounds = adapter.fitBounds;
    adapter.setView = (targetCenter: LatLng, targetZoom?: number) => {
      map.easeTo({
        center: toLngLat(targetCenter),
        zoom: typeof targetZoom === 'number' ? targetZoom : map.getZoom(),
        duration: 0,
      });
    };
    adapter.flyTo = (targetCenter: LatLng, targetZoom?: number, options?: any) => {
      map.flyTo({
        center: toLngLat(targetCenter),
        zoom: typeof targetZoom === 'number' ? targetZoom : map.getZoom(),
        duration: toMapLibreDuration(options?.duration),
        maxZoom: options?.maxZoom,
      } as any);
    };
    adapter.latLngToContainerPoint = ([lat, lng]: LatLng) => {
      const p = map.project([lng, lat]);
      return { x: p.x, y: p.y };
    };
    adapter.containerPointToLatLng = ([x, y]: [number, number]) => {
      const p = map.unproject([x, y]);
      return { lat: p.lat, lng: p.lng };
    };
    adapter.on = (eventName: string, handler: any) => map.on(eventName as any, handler);
    adapter.off = (eventName: string, handler: any) => map.off(eventName as any, handler);
    adapter.dragging = {
      enable: () => map.dragPan.enable(),
      disable: () => map.dragPan.disable(),
    };
    adapter.scrollWheelZoom = {
      enable: () => map.scrollZoom.enable(),
      disable: () => map.scrollZoom.disable(),
    };
    adapter.attributionControl = null;
    adapter.createPane = (name: string) => {
      let pane = map.getContainer().querySelector(`[data-pane="${name}"]`) as HTMLDivElement | null;
      if (!pane) {
        pane = document.createElement('div');
        pane.dataset.pane = name;
        pane.style.position = 'absolute';
        pane.style.inset = '0';
        pane.style.pointerEvents = 'none';
        map.getContainer().appendChild(pane);
      }
      return pane;
    };
    adapter.getPane = (name: string) => {
      return map.getContainer().querySelector(`[data-pane="${name}"]`) as HTMLDivElement | null;
    };

    MapContext.current = {
      map,
      adapter,
      attributionControl: null,
    };

    // Expose context immediately; child layer components handle style readiness.
    if (!readyRef.current) {
      readyRef.current = true;
      setReady(true);
      if (mapRef) mapRef.current = adapter;
      if (whenReady) whenReady({ target: adapter });
    }

    return () => {
      if (mapRef) mapRef.current = null;
      MapContext.current = null;
      map.remove();
      mapRefInternal.current = null;
      readyRef.current = false;
    };
  // Intentionally initialize map once; camera updates are handled via map APIs elsewhere.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const componentApi = useMemo(() => ({
    TileLayer,
    WMSTileLayer,
    CircleMarker,
    Popup,
    Circle,
    Marker,
    Tooltip,
    useMapEvents,
    useMap,
    Rectangle,
    Polygon,
    MultiPolygon,
    Polyline,
    AttributionControl,
  }), []);

  const leafletApi = useMemo(() => ({ DivIcon }), []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {ready && typeof children === 'function' ? children(componentApi, leafletApi) : null}
    </div>
  );
}

export default DynamicMap;
