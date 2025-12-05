// Helper function to calculate bounds from zoom level and center point
export const EARTH_CIRCUMFERENCE = 40075016.686;

export const MAP_DRAWER_BOTTOM_HEIGHT_REM = 8
export const MAP_DRAWER_MAX_HEIGHT_SVH = 60
export const MAP_DRAWER_TOP_SUBTRACT_REM = 4

// Web-Mercator helpers (Leaflet's default CRS: EPSG:3857)
const R = 6378137; // Earth radius used by Spherical Mercator (meters)
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const ORIGIN_SHIFT = Math.PI * R;            // ≈ 20037508.342789244
const WORLD_METERS = ORIGIN_SHIFT * 2;       // full world width in meters

function project([lat, lng]: [number, number]): [number, number] {
  // clamp to Mercator's valid latitude
  const MAX_LAT = 85.05112878;
  const φ = Math.max(Math.min(lat, MAX_LAT), -MAX_LAT) * D2R;
  const λ = lng * D2R;
  const x = R * λ;
  const y = R * Math.log(Math.tan(Math.PI / 4 + φ / 2));
  return [x, y];
}

function unproject([x, y]: [number, number]): [number, number] {
  const lng = (x / R) * R2D;
  const lat = (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * R2D;
  return [lat, lng];
}



/**
 * Calculate geographic bounds for a given container size, center and zoom,
 * using Leaflet's default CRS (EPSG:3857).
 * Returns [[north, west], [south, east]]
 */
export function boundsFromZoomAndCenter(
  containerDimensions: { width: number; height: number },
  center: [number, number],
  zoom: number,
  tileSize = 256 // keep in sync with your map's tileSize; 256 is Leaflet default
): [[number, number], [number, number]] {
  const scale = tileSize * Math.pow(2, zoom);             // L.CRS.EPSG3857.scale(zoom)
  const metersPerPixel = WORLD_METERS / scale;             // no +1 here

  const halfSpanX = (containerDimensions.width * metersPerPixel) / 2;
  const halfSpanY = (containerDimensions.height * metersPerPixel) / 2;

  const [cx, cy] = project(center);

  const minX = cx - halfSpanX;
  const maxX = cx + halfSpanX;
  const minY = cy - halfSpanY;
  const maxY = cy + halfSpanY;

  const [south, west] = unproject([minX, minY]);
  const [north, east] = unproject([maxX, maxY]);

  return [[north, west], [south, east]];
}


export const calculateRadius = (docCount: number, maxDocCount: number, minDocCount: number) => {
  const minRadius = .75; // Minimum radius for a marker
  const maxRadius = 1; // Maximum radius for a marker

  // Ensure docCount is within the range
  docCount = Math.max(minDocCount, Math.min(maxDocCount, docCount));

  if (maxDocCount === minDocCount) return minRadius;

  // Use a logarithmic scale for a wider distribution
  const logMax = Math.log(maxDocCount - minDocCount + 1);
  const logValue = Math.log(docCount - minDocCount + 1);
  const scaledRadius = (logValue / logMax) * (maxRadius - minRadius) + minRadius;

  return scaledRadius;
};

export const adjustBounds = (bounds: [[number, number], [number, number]], adjustmentFactor: number): [[number, number], [number, number]] => {
  // bounds format: [[north, west], [south, east]]
  const north = bounds[0][0];
  const west = bounds[0][1];
  const south = bounds[1][0];
  const east = bounds[1][1];

  // Calculate the center
  const centerLat = (north + south) / 2;
  const centerLon = (east + west) / 2;

  // Calculate half-spans and apply adjustment factor
  const latHalfSpan = Math.abs(north - south) * (1 + adjustmentFactor) / 2;
  const lonHalfSpan = Math.abs(east - west) * (1 + adjustmentFactor) / 2;

  // Calculate new bounds
  const newNorth = centerLat + latHalfSpan;
  const newSouth = centerLat - latHalfSpan;
  const newEast = centerLon + lonHalfSpan;
  const newWest = centerLon - lonHalfSpan;

  return [[newNorth, newWest], [newSouth, newEast]];
}

export const calculateCenterFromBounds = (bounds: [[number, number], [number, number]]): [number, number] => {
  const [northWest, southEast] = bounds;
  const [north, west] = northWest;
  const [south, east] = southEast;

  // Calculate center point
  const centerLat = (north + south) / 2;
  const centerLon = (west + east) / 2;

  return [centerLat, centerLon];
};

export const calculateZoomFromBounds = (bounds: [[number, number], [number, number]], center?: [number, number]): number => {
  const [northWest, southEast] = bounds;
  const [north, west] = northWest;
  const [south, east] = southEast;

  // Use provided center or calculate it
  const centerLat = center ? center[0] : (north + south) / 2;

  // Calculate spans in degrees
  const latSpan = Math.abs(north - south);
  const lonSpan = Math.abs(east - west);

  // Earth's circumference in meters
  const EARTH_CIRCUMFERENCE = 40075016.686;

  // Assuming the same container dimensions as the forward function
  const containerWidth = 800; // pixels
  const containerHeight = 600; // pixels

  // Convert degrees to meters
  const latSpanMeters = latSpan * 111111;
  const lonSpanMeters = lonSpan * 111111 * Math.cos(centerLat * Math.PI / 180);

  // Calculate meters per pixel for both dimensions
  const metersPerPixelWidth = lonSpanMeters / containerWidth;
  const metersPerPixelHeight = latSpanMeters / containerHeight;

  // Use the larger value to ensure the bounds fit within the container
  const metersPerPixel = Math.max(metersPerPixelWidth, metersPerPixelHeight);

  // Calculate zoom level from meters per pixel
  // Rearranging: metersPerPixel = EARTH_CIRCUMFERENCE / (256 * 2^zoom)
  // So: 2^zoom = EARTH_CIRCUMFERENCE / (256 * metersPerPixel)
  // And: zoom = log2(EARTH_CIRCUMFERENCE / (256 * metersPerPixel))
  return Math.log2(EARTH_CIRCUMFERENCE / (256 * metersPerPixel));
};





export const PRECISION_TO_DEGREES = [
  { precision: 0, degrees: 360 },
  { precision: 1, degrees: 180 },
  { precision: 2, degrees: 90 },
  { precision: 3, degrees: 45 },
  { precision: 4, degrees: 22.5 },
  { precision: 5, degrees: 11.25 },
  { precision: 6, degrees: 5.625 },
  { precision: 7, degrees: 2.8125 },
  { precision: 8, degrees: 1.40625 },
  { precision: 9, degrees: 0.703125 },
  { precision: 10, degrees: 0.3515625 },
  { precision: 11, degrees: 0.17578125 },
  { precision: 12, degrees: 0.087890625 },
  { precision: 13, degrees: 0.0439453125 },
  { precision: 14, degrees: 0.02197265625 },
  { precision: 15, degrees: 0.010986328125 },
  { precision: 16, degrees: 0.0054931640625 },
  { precision: 17, degrees: 0.00274658203125 },
  { precision: 18, degrees: 0.001373291015625 },
  { precision: 19, degrees: 0.0006866455078125 },
  { precision: 20, degrees: 0.00034332275390625 }
];

export const getGridSize = (bounds: [[number, number], [number, number]], currentZoom: number): { precision: number, gridSize: number } => {

  if (currentZoom < 4) return { precision: 0, gridSize: 1 }; // Default to the largest grid size for low zoom levels

  const [[north, west], [south, east]] = bounds;
  const latSpan = Math.abs(north - south);
  const lngSpan = Math.abs(east - west);

  const maxSpan = Math.max(latSpan, lngSpan);

  for (let i = PRECISION_TO_DEGREES.length - 1; i >= 0; i--) {
    if (PRECISION_TO_DEGREES[i].degrees >= maxSpan) {
      return {
        precision: PRECISION_TO_DEGREES[i].precision,
        gridSize: Math.pow(2, PRECISION_TO_DEGREES[i].precision)
      }
    }
  }

  return { precision: 0, gridSize: 1 }; // Default to the largest grid size if no match found
}



export function addPadding(bounds: [[number, number], [number, number]], isMobile: boolean): [[number, number], [number, number]] {
  if (isMobile) {
    const padding = bounds[1][0] - bounds[0][0]
    return [
      [bounds[0][0] - (padding / 3), bounds[0][1]],
      [bounds[1][0] + (padding * 3), bounds[1][1]]
    ]
  }
  else {
    const padding = (bounds[1][1] - bounds[0][1])
    return [
      [bounds[0][0], bounds[0][1] - padding],
      [bounds[1][0], bounds[1][1] + padding]
    ]
  }
}


export const getLabelBounds = (currentMap: any, label: string, lat: number, lon: number, remPx: number) => {
  if (!currentMap) return undefined;

  // Some wrappers/events expose the Leaflet map as `target`
  const map = (typeof currentMap?.latLngToContainerPoint === 'function' && typeof currentMap?.containerPointToLatLng === 'function')
    ? currentMap
    : (typeof currentMap?.target?.latLngToContainerPoint === 'function' && typeof currentMap?.target?.containerPointToLatLng === 'function')
      ? currentMap.target
      : undefined;

  if (!map) return undefined;

  // Visual heuristics (kept in sync with markers.ts)
  const textPx = remPx * 0.875;            // text-sm
  const textRem = 0.875;                   // text-sm in rem
  const avgCharWidthEm = 0.5;              // base glyph width in em
  const letterSpacingEm = 0.025;           // tracking-wide
  const xPadding = 0.25
  const perCharEm = avgCharWidthEm + letterSpacingEm
  const maxWidthRem = 8;                   // max-w-32
  const paddingXRemTotal = 0.75;           // px-1.5 total (both sides)
  const heightRem = 2;                   // text-sm line-height (1.25rem) + py-0.5 (0.25rem)
  const anchorOffsetRem = 1.875;             // -top-6

  // Estimate bubble width/height using rems (clamp text at max-w before padding)
  const textWidthRem = Math.min(label.length * (perCharEm * textRem), maxWidthRem) + (xPadding * 2);
  const widthRem = textWidthRem + paddingXRemTotal;
  const widthPx = Math.ceil(widthRem * remPx);
  const heightPx = Math.ceil(heightRem * remPx);
  const anchorOffsetPx = Math.ceil(anchorOffsetRem * remPx);

  // Screen-space rect relative to marker anchor
  const center = map.latLngToContainerPoint([lat, lon]);
  const x1 = center.x - (widthPx / 2);
  const x2 = center.x + (widthPx / 2);
  const y1 = center.y - anchorOffsetPx;   // bubble top positioned -top-6 above anchor
  const y2 = y1 + heightPx;               // bubble bottom

  // Convert to geographic bounds [[north, west], [south, east]]
  const nw = map.containerPointToLatLng([x1, y1]);
  const se = map.containerPointToLatLng([x2, y2]);
  return [[nw.lat, nw.lng], [se.lat, se.lng]] as [[number, number], [number, number]];
}

export const yDistance = (currentMap: any, lat1: number, lat2: number) => {
  // Calculate vertical pixel distance between two latitude points using map projection
  if (!currentMap) return 0;

  const point1 = currentMap.latLngToContainerPoint([lat1, 0]);
  const point2 = currentMap.latLngToContainerPoint([lat2, 0]);

  return Math.abs(point1.y - point2.y);
}

export const xDistance = (currentMap: any, lon1: number, lon2: number) => {
  // Calculate horizontal pixel distance between two longitude points using map projection
  if (!currentMap) return 0;
  const point1 = currentMap.latLngToContainerPoint([0, lon1]);
  const point2 = currentMap.latLngToContainerPoint([0, lon2]);
  return Math.abs(point1.x - point2.x);
}


export const groupSameCoordinates = (data: any) => {
  const childrenWithCoordinates = data.filter((child: any) => child.fields.location?.[0]?.coordinates?.length)
  const clientGroups: any[] = []
  const markerLookup: Record<string, any> = {}

  childrenWithCoordinates.forEach((child: any) => {
    const lat = child.fields.location[0].coordinates[1]
    const lon = child.fields.location[0].coordinates[0]
    const uuid = child.fields.uuid[0]
    let marker = markerLookup[lat + "_" + lon]
    if (!marker) {
      marker = { children: [], lat, lon, uuid }
      markerLookup[lat + "_" + lon] = marker
      clientGroups.push(marker)
    }

    const label = child.fields.label[0]

    if (typeof marker.label == 'string' && marker.label !== label && !marker.label.endsWith('...')) {
      marker.label = marker.label + "..."
    } else {
      marker.label = label
    }

    marker.children.unshift(child)
  })

  return clientGroups
}


export const getValidDegree = (degrees: number, maxValue: number): string => {
  if (Math.abs(degrees) > Math.abs(maxValue)) {
    return maxValue.toString()
  }
  return degrees.toString()
}


export const getMyLocation = (setMyLocation: (location: [number, number]) => void) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        setMyLocation(location);
        return location;
      },
      (error) => {
        console.error("Error getting the location: ", error);
        alert("Kunne ikkje finne din posisjon")
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert("Nettlesaren din støttar ikkje posisjonsbestemming")
  }
}

// Utility to pan a point into view with container-based padding for both mobile and desktop
export function panPointIntoView(
  map: any,
  point: [number, number],
  isMobile: boolean,
  maxDrawer?: boolean,
  reset?: boolean
) {
  if (!map || !point) return false;

  const [lat, lng] = point;
  const size = map.getSize();
  const zoom = map.getZoom();

  // Hard-coded paddings based on platform and drawer state
  let padLeft = 0, padRight = 0, padTop = 0, padBottom = 0;
  if (isMobile) {
    // Small top and x padding always on mobile
    padTop = Math.round(size.y * 0.08); // ~8%
    const xPadFrac = 0.05;              // 5% left/right
    padLeft = Math.round(size.x * xPadFrac);
    padRight = Math.round(size.x * xPadFrac);
    // Bottom reserved only when drawer is at max height
    padBottom = maxDrawer ? Math.round(size.y * (MAP_DRAWER_MAX_HEIGHT_SVH / 100)) : 0;
  } else {
    // Desktop: 25% left/right, small symmetric y padding
    padLeft = Math.round(size.x * 0.25);
    padRight = Math.round(size.x * 0.25);
    const yPad = Math.round(Math.min(120, size.y * 0.1));
    padTop = yPad;
    padBottom = yPad;
  }

  // Check visibility within padded rectangle
  const pt = map.latLngToContainerPoint([lat, lng]);
  const insideHoriz = pt.x >= padLeft && pt.x <= (size.x - padRight);
  const insideVert = pt.y >= padTop && pt.y <= (size.y - padBottom);

  if (reset || !(insideHoriz && insideVert)) {
    const eps = 1e-6;
    map.fitBounds(
      [[lat + eps, lng - eps], [lat - eps, lng + eps]],
      {
        paddingTopLeft: [padLeft, padTop],
        paddingBottomRight: [padRight, padBottom],
        maxZoom: zoom,
        duration: 0.05
      }
    );
    return true
  }
  return false
}

/**
 * Fit map bounds to group sources
 * If there are multiple sources with coordinates, fits to bounds
 * Otherwise, flies to single point at zoom 15
 */
export function fitBoundsToGroupSources(
  mapInstance: any,
  groupData: any,
  options?: {
    duration?: number;
    padding?: [number, number];
    maxZoom?: number;
  }
) {
  if (!mapInstance || !groupData) return;

  const { duration = 0.25, padding = [50, 50], maxZoom = 18 } = options || {};

  // Filter sources with valid coordinates
  const sourcesWithCoords = groupData.sources.filter(
    (source: Record<string, any>) => source?.location?.coordinates?.length === 2
  );

  if (sourcesWithCoords.length > 1) {
    // Find bounds: southwest and northeast corners
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    sourcesWithCoords.forEach((source: Record<string, any>) => {
      const [lng, lat] = source.location.coordinates;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    // Fly to bounds with padding
    mapInstance.flyToBounds(
      [
        [minLat, minLng],
        [maxLat, maxLng]
      ],
      { duration, padding, maxZoom }
    );
  } else if (sourcesWithCoords.length === 1 || groupData.fields?.location?.[0]?.coordinates) {
    // Default: fly to group location at zoom 15
    const coords = sourcesWithCoords.length === 1
      ? sourcesWithCoords[0].location.coordinates
      : groupData.fields.location[0].coordinates;
    mapInstance.flyTo([coords[1], coords[0]], 15, { duration });
  }
}

