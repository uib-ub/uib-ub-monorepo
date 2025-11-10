import {useGroupDebugData, useGniduData, useTopH3Groups, useTopUUIDGroups} from "@/state/hooks/group-debug-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useDebugStore } from "@/state/zustand/debug-store";
import * as h3 from "h3-js";
import Link from "next/link";
import { Fragment, useCallback, useContext, useState, useEffect } from "react";
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
    const { data: topH3Data } = useTopH3Groups();
    const { data: topUUIDData } = useTopUUIDGroups();

    // Get top groups from API (already sorted and filtered)
    // Only use data when the respective setting is enabled
    const top5Groups = showTop3H3Counts && topH3Data?.hits?.hits
      ? topH3Data.hits.hits.filter((g: any) => g._id !== selectedGroup?._id)
      : [];

    // Generate random colors for top 5 groups
    const getRandomColor = (index: number) => {
      const colors = ['#ff6600', '#ff3366', '#33ff66', '#3366ff', '#ff33cc'];
      return colors[index % colors.length];
    };

    const top3uuidGroups = showTop3UUIDCounts && topUUIDData?.hits?.hits
      ? topUUIDData.hits.hits.filter((g: any) => g._id !== selectedGroup?._id)
      : [];

    // Create lookup maps for faster ID matching
    const top5GroupsMap = new Map(top5Groups.map((g: any, idx: number) => [g._id, idx]));
    const top3uuidGroupsMap = new Map(top3uuidGroups.map((g: any, idx: number) => [g._id, idx]));


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

  // Create a custom pane for polygons/hexagons with lower z-index
  useEffect(() => {
    if (mapInstance.current) {
      const map = mapInstance.current;
      if (!map.getPane('polygonPane')) {
        const polygonPane = map.createPane('polygonPane');
        polygonPane.style.zIndex = '300'; // Lower than default overlayPane (400)
      }
    }
  }, [mapInstance]);

    return <>
    {/* ALL HEXAGON POLYGONS - RENDERED FIRST TO APPEAR BEHIND MARKERS */}
    

    {/* Geotile grid */}
    { showGeotileGrid && markerCells.map((cell: any) => {
        const bounds = geotileKeyToBounds(cell.key)
        if (!bounds) return null;
        return <Rectangle
        key={`cell-${cell.key}`}
        bounds={bounds}
        pane="polygonPane"
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
                pane="polygonPane"
                pathOptions={{
                  color: '#666',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0
                }}
              />
            ))}

    {/* H3 cells for selected group - from children data */}
    {selectedGroup && selectedGroup._source?.misc?.children?.length > 0 && debugChildren?.hits?.hits && (() => {
      // Collect all unique H3 cell IDs from children
      const h3Cells = new Set<string>();
      debugChildren.hits.hits.forEach((child: any) => {
        if (child._source?.h3) {
          h3Cells.add(child._source.h3);
        }
      });
      
      return Array.from(h3Cells).map((hexId: string) => {
        const boundary = h3.cellToBoundary(hexId);
        const isPortal = selectedGroup._source?.portals?.includes(hexId);
        const isMain = selectedGroup._source?.h3 === hexId;
        const color = isPortal ? 'red' : isMain ? '#000000' : 'blue';
        return <Polygon key={`debug-cell-selected-h3-${hexId}`} positions={boundary} pane="polygonPane" pathOptions={{ color: color, weight: 3, opacity: 1, fillOpacity: 0.35 }} />;
      });
    })()}

    {/* GNIDU polygons - rendered before markers to appear behind */}
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
                            pane="polygonPane"
                            pathOptions={pathOptions}
                        />;
                    case 'MultiPolygon':
                        return (
                            <Fragment key={`debug-gnidu-${item._id}`}>
                                {geoJSON.coordinates.map((polygonCoords, index) => (
                                    <Polygon
                                        key={`debug-gnidu-${item._id}-${index}`}
                                        positions={polygonCoords[0].map(coord => [coord[1], coord[0]])} // Swap to [lat, lon] for Leaflet
                                        pane="polygonPane"
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


    {/* ALL MARKERS - RENDERED AFTER HEXAGONS TO APPEAR ON TOP */}

            {showDebugGroups && debugGroups?.hits?.hits?.map((group: any) => {
              // Skip if location or coordinates are missing
              if (!group._source?.location?.coordinates) return null;
              
              const isSelected = group._id === selectedGroup?._id;
              // Only check for top status when the respective setting is enabled, using lookup maps
              const top5IndexValue = showTop3H3Counts ? top5GroupsMap.get(group._id) : undefined;
              const top5Index = top5IndexValue !== undefined ? top5IndexValue : -1;
              const isTop5 = top5Index !== -1;
              const top3UuidIndexValue = showTop3UUIDCounts ? top3uuidGroupsMap.get(group._id) : undefined;
              const top3UuidIndex = top3UuidIndexValue !== undefined ? top3UuidIndexValue : -1;
              const isTop3Uuid = top3UuidIndex !== -1;
              const top5Color = isTop5 ? getRandomColor(typeof top5Index === 'number' ? top5Index : 0) : '#666';
              const top3UuidColor = isTop3Uuid ? getRandomColor(typeof top3UuidIndex === 'number' ? top3UuidIndex : 0) : '#666';

              // Determine marker size: large for top groups, small for regular groups
              const isTopGroup = isTop5 || isTop3Uuid;
              const radius = isSelected ? 5 : isTopGroup ? 5 : 4;
              const weight = isSelected ? 3 : isTopGroup ? 3 : 2;
              const fillOpacity = isSelected ? 0.1 : isTopGroup ? 0.8 : 0.2;
              const color = isSelected ? '#000000' : (isTop5 ? top5Color : isTop3Uuid ? top3UuidColor : '#666');
              
              // List child names in the popup if this is the selected group
              let childList = null;
              const selectedGroupHasChildren = selectedGroup?._source?.misc?.children?.length > 0;
              if (isSelected && selectedGroupHasChildren && debugChildren?.hits?.hits?.length > 0) {
                childList = (
                  <>
                    <br />
                    <b>Children:</b>
                    <ul style={{ maxHeight: 64, overflowY: 'auto', margin: 0, paddingLeft: '1em' }}>
                      {debugChildren.hits.hits.map((item: any) => (
                        <li key={item._id} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 150 }}>
                        <Link href={`/uuid/${item._source.uuid}`}> {item._source.label || item._id}</Link>
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
                  radius={radius}
                  pathOptions={{
                    color: color,
                    weight: weight,
                    opacity: 1,
                    fillOpacity: fillOpacity
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
                      <div className="flex flex-col gap-1">
                        <span>
                          <b>Group:</b>
                          <Link href={`/uuid/${group._source.uuid}`}> {group._source.label || group._id}</Link>
                        </span>
                        {group._source.misc?.root && (
                          <span>
                            <b>Root:</b>
                            <Link href={`/uuid/${group._source.misc?.root}`}> {group._source.misc.root}</Link>
                          </span>
                        )}
                        {(isTop5 && !isSelected && typeof top5Index === 'number') && (
                          <span style={{ color: top5Color, fontWeight: 'bold' }}>
                            {" "}(Top 5 H3 #{top5Index + 1})
                          </span>
                        )}
                        {(isTop3Uuid && !isSelected && !isTop5 && typeof top3UuidIndex === 'number') && (
                          <span style={{ color: top3UuidColor, fontWeight: 'bold' }}>
                            {" "}(Top 3 UUID #{top3UuidIndex + 1})
                          </span>
                        )}
                        {group._source?.misc?.child_count !== undefined && (
                          <span>
                            <b>UUID count:</b> {group._source.misc?.child_count}
                          </span>
                        )}
                        {group._source?.gnidu?.length > 0 && (
                          <span>
                            <b>GNIDU:</b> {group._source.gnidu.join(', ')}
                          </span>
                        )}
                      </div>
                      {group._source?.misc?.h3_count !== undefined && (
                        <span>
                          <b>H3 count:</b> {group._source.misc.h3_count}
                        </span>
                      )}
                      {childList}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {showDebugGroups && selectedGroup && selectedGroup._source?.misc?.children?.length > 0 && debugChildren?.hits?.hits?.map((item: any) => {
              // Skip if location or coordinates are missing
              if (!item._source?.location?.coordinates) return null;
              
              return (
                <CircleMarker
                  key={`debug-child-${item._id}`}
                  center={[item._source.location.coordinates[1], item._source.location.coordinates[0]]}
                  radius={item._source.uuid == selectedGroup._source.misc.root ? 24 : 2}
                  pathOptions={{ color: item._source.uuid == selectedGroup._source.misc.root ? 'red' : 'blue', weight: item._source.uuid == selectedGroup._source.misc.root ? 3 : 2, opacity: 1, fillOpacity: 0 }}
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
                      <b>Dataset:</b> {item._index.split('-')[2]}
                      {["snid", "gnidu", "ssr", "wikidata", "geonames"].filter(field => item._source[field]).map(
                        (field) => <Fragment key={field}><br />
                        <b>{field.charAt(0).toUpperCase() + field.slice(1)}:</b> {item._source[field]}
                        </Fragment>
                      )}
                      <br />
                      <b>ID:</b> {item._source.uuid}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

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
            {showTop3H3Counts && top5Groups.length > 0 && (
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
                          H3: {group._source?.misc?.h3_count || 0} | 
                          UUID: {group._source?.misc?.child_count || 0}
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
                          H3: {group._source?.misc?.h3_count || 0} | 
                          UUID: {group._source?.misc?.child_count || 0}
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