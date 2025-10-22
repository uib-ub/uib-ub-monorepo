import { GlobalContext } from "@/state/providers/global-provider";
import { useDebugStore } from "@/state/zustand/debug-store";
import * as h3 from "h3-js";
import { useCallback, useContext } from "react";

export default function DebugLayers({mapInstance, Polygon, Rectangle, geotileKeyToBounds, groupData, markerCells }: {mapInstance: any, Polygon: any, Rectangle: any, geotileKeyToBounds: any, groupData: any, markerCells: any}) {

    const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
    const h3Resolution = useDebugStore(state => state.h3Resolution);
    const setH3Resolution = useDebugStore(state => state.setH3Resolution);
    const showH3Grid = useDebugStore(state => state.showH3Grid);


      // Modify getH3Cells to use the resolution state
  const getH3Cells = useCallback((bounds: any) => {
    if (!bounds) return [];

    const zoomLevel = mapInstance.current?.getZoom() || 0;
    // Don't show high resolution grids when zoomed out
    if (zoomLevel < 5) return [];
    if (zoomLevel < 7 && h3Resolution > 4) return [];
    if (zoomLevel < 9 && h3Resolution > 5) return [];
    if (zoomLevel < 11 && h3Resolution > 6) return [];
    if (zoomLevel < 13 && h3Resolution > 7) return [];
    if (zoomLevel < 15 && h3Resolution > 8) return [];

    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    const bboxPolygon = [
      [north, west],
      [north, east],
      [south, east],
      [south, west],
      [north, west]
    ];

    const hexagons = h3.polygonToCells(bboxPolygon, h3Resolution);

    return hexagons.map((hexId: string) => {
      const boundary = h3.cellToBoundary(hexId);
      return boundary;
    });
  }, [h3Resolution, mapInstance]);



    return <>
    {groupData?.misc?.h3_cells?.map((hexId: string) => {
              const boundary = h3.cellToBoundary(hexId);
              return <Polygon key={`debug-cell-${hexId}`} positions={boundary} pathOptions={{ color: '#ff00ff', weight: 1, opacity: 0.8, fillOpacity: 0.05 }} />;
            })}

    { showGeotileGrid && markerCells.map((cell: any) => {
        const bounds = geotileKeyToBounds(cell.key)
        if (!bounds) return null;
        return <Rectangle
        key={`cell-${cell.key}`}
        bounds={bounds}
        pathOptions={{
            color: '#0078ff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0
        }}
        />
    })}

    {/* Add H3 grid overlay */}
    {showH3Grid && mapInstance.current && getH3Cells(mapInstance.current.getBounds()).map((polygon, index) => (
              <Polygon
                key={`h3-${index}`}
                positions={polygon}
                pathOptions={{
                  color: '#666',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0
                }}
              />
            ))}


            
            </>

}