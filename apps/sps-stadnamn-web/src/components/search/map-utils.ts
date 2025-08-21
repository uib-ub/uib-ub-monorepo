// Helper function to calculate bounds from zoom level and center point
export const calculateBoundsFromZoomAndCenter = (center: [number, number], zoom: number): [[number, number], [number, number]] => {
    // Earth's circumference in meters
    const EARTH_CIRCUMFERENCE = 40075016.686;
    
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
  