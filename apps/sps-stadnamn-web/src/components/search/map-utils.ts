// Helper function to calculate bounds from zoom level and center point
export const EARTH_CIRCUMFERENCE = 40075016.686;

export const boundsFromZoomAndCenter = (center: [number, number], zoom: number): [[number, number], [number, number]] => {
    // Earth's circumference in meters
    
    // Calculate the distance represented by one pixel at the given zoom level
    // At zoom level 0, one pixel represents the entire world
    const metersPerPixel = EARTH_CIRCUMFERENCE / (256 * Math.pow(2, zoom));
    
    // Assuming a typical map container size (you can adjust these values)
    const containerWidth = 800; // pixels
    const containerHeight = 600; // pixels
    
    // Calculate the geographic span in meters
    const spanWidthMeters = metersPerPixel * containerWidth;
    const spanHeightMeters = metersPerPixel * containerHeight;
    
    // Convert meters to degrees (approximate)
    // 1 degree of latitude ≈ 111,111 meters
    // 1 degree of longitude ≈ 111,111 * cos(latitude) meters
    const latSpan = spanHeightMeters / 111111;
    const lonSpan = spanWidthMeters / (111111 * Math.cos(center[0] * Math.PI / 180));
    
    // Calculate bounds
    const north = center[0] + latSpan / 2;
    const south = center[0] - latSpan / 2;
    const east = center[1] + lonSpan / 2;
    const west = center[1] - lonSpan / 2;
    
    return [[north, west], [south, east]];
  };
  
  
  
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

export const getGridSize = (bounds: [[number, number], [number, number]]): number => {

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
    return Math.pow(2, PRECISION_TO_DEGREES[0].precision);
}
