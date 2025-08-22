// Helper function to calculate bounds from zoom level and center point
export const EARTH_CIRCUMFERENCE = 40075016.686;

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

export const getGridSize = (bounds: [[number, number], [number, number]], currentZoom: number): number | null => {

  if (currentZoom < 4) return null;;

    const [[north, west], [south, east]] = bounds;
    const latSpan = Math.abs(north - south);
    const lngSpan = Math.abs(east - west);

    const maxSpan = Math.max(latSpan, lngSpan);

    for (let i = PRECISION_TO_DEGREES.length - 1; i >= 0; i--) {
        if (PRECISION_TO_DEGREES[i].degrees >= maxSpan) {
          return Math.pow(2, PRECISION_TO_DEGREES[i].precision);
        }
    }
    
    // Return highest precision if bounds are too small
    throw new Error("Bounds are too small")
    return Math.pow(2, PRECISION_TO_DEGREES[0].precision);
}
