import {useGroupDebugData, useGniduData} from "@/state/hooks/group-debug-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useDebugStore } from "@/state/zustand/debug-store";
import * as h3 from "h3-js";
import { Fragment, useCallback, useContext, useState } from "react";
import * as wkt from "wellknown";


export default function DebugLayers({mapInstance, 
                                    Polygon, 
                                    Polyline, 
                                    Rectangle, 
                                    CircleMarker, 
                                    Popup, 
                                    geotileKeyToBounds, 
                                    groupData, 
                                    markerCells }: {mapInstance: any, Polygon: any, Polyline: any, Rectangle: any, CircleMarker: any, Popup: any, geotileKeyToBounds: any, groupData: any, markerCells: any}) {
    const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
    const h3Resolution = useDebugStore(state => state.h3Resolution);
    const setH3Resolution = useDebugStore(state => state.setH3Resolution);
    const showH3Grid = useDebugStore(state => state.showH3Grid);
    const showDebugGroups = useDebugStore(state => state.showDebugGroups);
    const showTop3H3Counts = useDebugStore(state => state.showTop3H3Counts);
    const showTop3UUIDCounts = useDebugStore(state => state.showTop3UUIDCounts);


    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedGnidu, setSelectedGnidu] = useState<any>(null);

    const {data: debugGroups } = useGroupDebugData();
    const { data: debugChildren } = useGroupDebugData(selectedGroup);
    const { data: gniduData } = useGniduData(selectedGroup);

    // Get top 5 groups by h3_count
    const top5Groups = debugGroups?.hits?.hits
      ?.filter((g: any) => g._id !== selectedGroup?._id)
      ?.sort((a: any, b: any) => (b._source?.h3_count || 0) - (a._source?.h3_count || 0))
      ?.slice(0, 3) || [];

    // Generate random colors for top 5 groups
    const getRandomColor = (index: number) => {
      const colors = ['#ff6600', '#ff3366', '#33ff66', '#3366ff', '#ff33cc'];
      return colors[index % colors.length];
    };

    const top3uuidGroups = debugGroups?.hits?.hits
      ?.filter((g: any) => g._id !== selectedGroup?._id)
      ?.sort((a: any, b: any) => (b._source?.uuid_count || 0) - (a._source?.uuid_count || 0))
      ?.slice(0, 3) || [];


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
    {/* ALL HEXAGON POLYGONS - RENDERED FIRST TO APPEAR BEHIND MARKERS */}
    

    {/* Geotile grid */}
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

    {/* H3 grid overlay */}
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

    {/* Top 5 groups H3 cells - behind markers */}
    {showTop3H3Counts && (debugGroups && Array.isArray(debugGroups.hits?.hits)) && debugGroups.hits.hits
      .filter((g: any) => g._id !== selectedGroup?._id) // Exclude selected group
      .sort((a: any, b: any) => (b._source?.h3_count || 0) - (a._source?.h3_count || 0))
      .slice(0, 5)
      .map((group: any, groupIndex: number) => {
        const groupColor = getRandomColor(groupIndex);
        return group._source?.h3_cells?.map((hexId: string) => {
          const boundary = h3.cellToBoundary(hexId);
          return (
            <Polygon
              key={`debug-cell-top5-${group._id}-${hexId}`}
              positions={boundary}
              pathOptions={{ color: groupColor, weight: 1, opacity: 0.65, fillOpacity: 0.07 }}
            />
          );
        });
      })
    }

    {/* Top 3 groups UUID cells - behind markers */}
    {showTop3UUIDCounts && top3uuidGroups.map((group: any, groupIndex: number) => {
      const groupColor = getRandomColor(groupIndex);
      return group._source?.h3_cells?.map((hexId: string) => {
        const boundary = h3.cellToBoundary(hexId);
        return (
          <Polygon
            key={`debug-cell-top3-uuid-${group._id}-${hexId}`}
            positions={boundary}
            pathOptions={{ color: groupColor, weight: 1, opacity: 0.8, fillOpacity: 0.1 }}
          />
        );
      });
    })}

    {/* Selected group merged_h3 cells - most prominent, behind markers */}
    {selectedGroup?._source?.merged_cells?.map((hexId: string) => {
      const boundary = h3.cellToBoundary(hexId);
      return (
        <Polygon
          key={`debug-cell-selected-merged_h3-${hexId}`}
          positions={boundary}
          pathOptions={{ color: '#000000', weight: 3, opacity: 1, fillOpacity: 0.15 }}
        />
      );
    })}


    {selectedGroup?._source?.allCells.map((hexId: string) => {  
      const boundary = h3.cellToBoundary(hexId);
      const isPortal = selectedGroup._source.portals?.includes(hexId);
      const isMain = selectedGroup._source.h3 === hexId;
      const color = isPortal ? 'red' : isMain ? '#000000' : 'blue';
      return <Polygon key={`debug-cell-selected-h3-${hexId}`} positions={boundary} pathOptions={{ color: color, weight: 3, opacity: 1, fillOpacity: 0.35 }} />;
    })}


    {/* ALL MARKERS - RENDERED AFTER HEXAGONS TO APPEAR ON TOP */}

            {showDebugGroups && debugGroups?.hits?.hits?.map((group: any) => {
              const isSelected = group._id === selectedGroup?._id;
              const top5Index = top5Groups.findIndex((g: any) => g._id === group._id);
              const isTop5 = top5Index !== -1;
              const top3UuidIndex = top3uuidGroups.findIndex((g: any) => g._id === group._id);
              const isTop3Uuid = top3UuidIndex !== -1;
              const top5Color = isTop5 ? getRandomColor(top5Index) : '#666';
              const top3UuidColor = isTop3Uuid ? getRandomColor(top3UuidIndex) : '#666';
              
              // List child names in the popup if this is the selected group
              let childList = null;
              if (isSelected && debugChildren?.hits?.hits?.length > 0) {
                childList = (
                  <>
                    <br />
                    <b>Children:</b>
                    <ul style={{ maxHeight: 64, overflowY: 'auto', margin: 0, paddingLeft: '1em' }}>
                      {debugChildren.hits.hits.map((item: any) => (
                        <li key={item._id} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 150 }}>
                          {item._source.label || item._id}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              }

              return (
                <CircleMarker
                  key={`debug-group-${group._id}`}
                  center={[group._source.location.coordinates[1], group._source.location.coordinates[0]]}
                  radius={isSelected ? 5 : (isTop5 || isTop3Uuid) ? 4 : 2}
                  pathOptions={{
                    color: isSelected ? '#000000' : (isTop5 ? top5Color : isTop3Uuid ? top3UuidColor : '#666'),
                    weight: isSelected ? 25 : (isTop5 || isTop3Uuid) ? 15 : 10,
                    opacity: 1,
                    fillOpacity: isSelected ? 0.4 : (isTop5 || isTop3Uuid) ? 0.3 : 0
                  }}
                  eventHandlers={{
                    click: () => setSelectedGroup(group)
                  }}
                >
                  <Popup 
                    maxWidth={240}
                    maxHeight={150}
                    autoPan={false}
                    closeButton={true}
                  >
                    <div style={{ maxWidth: 220, maxHeight: 110, overflowY: 'auto', wordBreak: 'break-word' }}>
                      <b>Group:</b> {group._source.label || group._id}
                      {isTop5 && !isSelected && <span style={{ color: top5Color, fontWeight: 'bold' }}> (Top 5 H3 #{top5Index + 1})</span>}
                      {isTop3Uuid && !isSelected && !isTop5 && <span style={{ color: top3UuidColor, fontWeight: 'bold' }}> (Top 3 UUID #{top3UuidIndex + 1})</span>}
                      {isSelected && <span style={{ color: '#000000', fontWeight: 'bold' }}> (SELECTED)</span>}
                      <br />
                      <b>ID:</b> {group._id}
                      {group._source?.uuid_count !== undefined && (
                        <>
                          <br />
                          <b>UUID count:</b> {group._source.uuid_count}
                        </>
                      )}
                      {group._source?.gnidu?.length > 0 && (
                        <>
                          <br />
                          <b>GNIDU:</b> {group._source.gnidu.join(', ')}
                        </>
                      )}
                      {group._source?.h3_count !== undefined && (
                        <>
                          <br />
                          <b>H3 count:</b> {group._source.h3_count}
                        </>
                      )}
                      {childList}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {showDebugGroups && selectedGroup && debugChildren?.hits?.hits?.map((item: any) => {
              return (
                <CircleMarker
                  key={`debug-child-${item._id}`}
                  center={[item._source.location.coordinates[1], item._source.location.coordinates[0]]}
                  radius={2}
                  pathOptions={{ color: 'red', weight: 2, opacity: 1, fillOpacity: 0 }}
                >
                  <Popup
                    maxWidth={180}
                    maxHeight={100}
                    autoPan={false}
                    closeButton={true}
                  >
                    <div style={{ maxWidth: 160, maxHeight: 80, overflowY: 'auto', wordBreak: 'break-word' }}>
                      <b>Name:</b> {item._source.label || item._id}
                      <br />
                      <b>ID:</b> {item._id}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            { gniduData?.hits?.hits?.filter((item: any) => item._source?.area).map((item: any) => {
                    const areaWkt = item._source?.area;
                    const isSelected = selectedGnidu?._id === item._id;

                    try {

                        const geoJSON = wkt.parse(areaWkt);
                        if (!geoJSON) return null;

                        console.log("GEOJSON", geoJSON);

                        const pathOptions = isSelected 
                            ? { color: 'red', weight: 3, opacity: 1, fillOpacity: 0.2 }
                            : { color: 'silver', weight: 1, opacity: 0.8, fillOpacity: 0.05 };

                        switch (geoJSON.type) {
                            case 'Polygon':
                                return <Polygon
                                    key={`debug-gnidu-${item._id}`}
                                    positions={geoJSON.coordinates[0].map(coord => [coord[1], coord[0]])} // Swap to [lat, lon] for Leaflet
                                    pathOptions={pathOptions}
                                />;
                            case 'MultiPolygon':
                                return (
                                    <Fragment key={`debug-gnidu-${item._id}`}>
                                        {geoJSON.coordinates.map((polygonCoords, index) => (
                                            <Polygon
                                                key={`debug-gnidu-${item._id}-${index}`}
                                                positions={polygonCoords[0].map(coord => [coord[1], coord[0]])} // Swap to [lat, lon] for Leaflet
                                                pathOptions={pathOptions}
                                            />
                                        ))}
                                    </Fragment>
                                );

                            default:
                                return null;
                        }
                    } catch (error) {
                        console.error('Failed to parse WKT:', error);
                        return null;
                    }
            }).filter((item: any) => item !== null)

            }

            {/* GNIDU List Overlay */}
            {gniduData?.hits?.hits?.length > 0 && (
              <div className="absolute bottom-64 left-4 bg-white/95 border border-gray-300 rounded-lg p-3 max-w-xs max-h-96 overflow-y-auto shadow-lg z-[1000] text-xs font-sans">
                <div className="font-bold mb-2 text-gray-800">
                  GNIDU Items
                </div>
                {gniduData.hits.hits.map((item: any, index: number) => {
                  const isSelected = selectedGnidu?._id === item._id;
                  return (
                    <div
                      key={`gnidu-list-${item._id}`}
                      className={`p-2 my-1 rounded cursor-pointer transition-colors ${
                        isSelected ? 'bg-black text-white' : 'bg-gray-50 hover:bg-blue-100'
                      }`}
                      onClick={() => setSelectedGnidu(isSelected ? null : item)}
                    >
                      <div className="font-bold">
                        {item._source?.label || item._id}
                      </div>
                      <div className="text-xs opacity-75">
                        ID: {item._id}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-3 text-xs text-gray-600 text-center italic">
                  Click to select/deselect
                </div>
              </div>
            )}

            {/* Top 5 Groups List Overlay */}
            {showDebugGroups && top5Groups.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-white/95 border border-gray-300 rounded-lg p-3 max-w-xs max-h-96 overflow-y-auto shadow-lg z-[1000] text-xs font-sans">
                <div className="font-bold mb-2 text-gray-800">
                  Top 5 Groups (by H3 count)
                </div>
                {top5Groups.map((group: any, index: number) => {
                  const groupColor = getRandomColor(index);
                  return (
                    <div
                      key={`top5-list-${group._id}`}
                      className={`p-2 my-1 rounded cursor-pointer flex justify-between items-center transition-colors ${
                        index === 0 ? 'bg-yellow-100' : 'bg-gray-50'
                      } hover:bg-blue-100`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="font-bold" style={{ color: groupColor }}>
                          #{index + 1} {group._source.label || group._id}
                        </div>
                        <div className="text-xs text-gray-600">
                          H3: {group._source?.h3_count || 0} | 
                          UUID: {group._source?.uuid_count || 0}
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ 
                          background: groupColor,
                          boxShadow: `0 0 0 1px ${groupColor}`
                        }}
                      />
                    </div>
                  );
                })}
                <div className="mt-3 text-xs text-gray-600 text-center italic">
                  Click to select group
                </div>
              </div>
            )}

            {/* Top 3 UUID Groups List Overlay */}
            {showTop3UUIDCounts && top3uuidGroups.length > 0 && (
              <div className="absolute bottom-4 left-64 bg-white/95 border border-gray-300 rounded-lg p-3 max-w-xs max-h-96 overflow-y-auto shadow-lg z-[1000] text-xs font-sans">
                <div className="font-bold mb-2 text-gray-800">
                  Top 3 Groups (by UUID count)
                </div>
                {top3uuidGroups.map((group: any, index: number) => {
                  const groupColor = getRandomColor(index);
                  return (
                    <div
                      key={`top3-uuid-list-${group._id}`}
                      className={`p-2 my-1 rounded cursor-pointer flex justify-between items-center transition-colors ${
                        index === 0 ? 'bg-yellow-100' : 'bg-gray-50'
                      } hover:bg-blue-100`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="font-bold" style={{ color: groupColor }}>
                          #{index + 1} {group._source.label || group._id}
                        </div>
                        <div className="text-xs text-gray-600">
                          H3: {group._source?.h3_count || 0} | 
                          UUID: {group._source?.uuid_count || 0}
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ 
                          background: groupColor,
                          boxShadow: `0 0 0 1px ${groupColor}`
                        }}
                      />
                    </div>
                  );
                })}
                <div className="mt-3 text-xs text-gray-600 text-center italic">
                  Click to select group
                </div>
              </div>
            )}
            </>
}