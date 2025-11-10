import {useGroupDebugData, useGniduData, useTopGroups, useSortedGroups} from "@/state/hooks/group-debug-data";
import { useDebugStore } from "@/state/zustand/debug-store";
import * as h3 from "h3-js";
import Link from "next/link";
import { Fragment, useCallback, useState, useEffect, useRef } from "react";
import * as wkt from "wellknown";
import Clickable from "../ui/clickable/clickable";
import { useSearchParams } from "next/navigation";
import { PiX } from "react-icons/pi";


export default function DebugLayers({mapInstance, 
                                    Polygon, 
                                    Rectangle, 
                                    CircleMarker, 
                                    geotileKeyToBounds, 
                                    markerCells }: {mapInstance: any, Polygon: any, Rectangle: any, CircleMarker: any, geotileKeyToBounds: any, markerCells: any}) {
    const showGeotileGrid = useDebugStore(state => state.showGeotileGrid);
    const h3Resolution = useDebugStore(state => state.h3Resolution);
    const showH3Grid = useDebugStore(state => state.showH3Grid);
    const searchParams = useSearchParams();
    const showDebugGroups = searchParams.get('debugGroups') == 'on';
    const highlightTopGroups = useDebugStore(state => state.highlightTopGroups);
    const setHighlightTopGroups = useDebugStore(state => state.setHighlightTopGroups);
    const debugGroupsSortBy = useDebugStore(state => state.debugGroupsSortBy);
    const setDebugGroupsSortBy = useDebugStore(state => state.setDebugGroupsSortBy);
    
    // Get URL parameters for filtering children
    const snidParam = searchParams.get('snid');
    const wikidataParam = searchParams.get('wikidata');
    const ssrParam = searchParams.get('ssr');
    const geonamesParam = searchParams.get('geonames');


    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const selectedGroupRef = useRef<any>(null);
    const [selectedGnidu, setSelectedGnidu] = useState<any>(null);
    const [selectedChild, setSelectedChild] = useState<string | null>(null);
    const childListItemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
    
    // Preserve selected group data even when queries update
    useEffect(() => {
      selectedGroupRef.current = selectedGroup;
      // Clear selected child when group changes
      setSelectedChild(null);
    }, [selectedGroup]);
    
    // Use ref value if state is cleared but we still have the ref
    const preservedSelectedGroup = selectedGroup || selectedGroupRef.current;

    const {data: debugGroups } = useGroupDebugData();
    const { data: sortedGroups } = useSortedGroups();
    const { data: debugChildren } = useGroupDebugData(preservedSelectedGroup);
    const { data: gniduData } = useGniduData(preservedSelectedGroup);
    const { data: topGroupsData } = useTopGroups();
    
    // Filter children based on URL parameters
    const filteredChildren = debugChildren?.hits?.hits?.filter((item: any) => {
        // If no filter params are set, show all children
        if (!snidParam && !wikidataParam && !ssrParam && !geonamesParam) {
            return true;
        }
        
        // Check each parameter - child must match all specified parameters
        if (snidParam && item._source.snid !== snidParam) {
            return false;
        }
        if (wikidataParam && item._source.wikidata !== wikidataParam) {
            return false;
        }
        if (ssrParam && item._source.ssr !== ssrParam) {
            return false;
        }
        if (geonamesParam && item._source.geonames !== geonamesParam) {
            return false;
        }
        
        return true;
    }) || [];

    // Disable map dragging when mouse is over overlay elements
    useEffect(() => {
      if (!mapInstance.current) return;
      
      const map = mapInstance.current;
      const overlays = document.querySelectorAll('[data-debug-overlay]');
      
      const handleMouseEnter = () => {
        if (map.dragging) {
          map.dragging.disable();
        }
        if (map.scrollWheelZoom) {
          map.scrollWheelZoom.disable();
        }
      };
      
      const handleMouseLeave = () => {
        if (map.dragging) {
          map.dragging.enable();
        }
        if (map.scrollWheelZoom) {
          map.scrollWheelZoom.enable();
        }
      };
      
      overlays.forEach(overlay => {
        overlay.addEventListener('mouseenter', handleMouseEnter);
        overlay.addEventListener('mouseleave', handleMouseLeave);
      });
      
      return () => {
        overlays.forEach(overlay => {
          overlay.removeEventListener('mouseenter', handleMouseEnter);
          overlay.removeEventListener('mouseleave', handleMouseLeave);
        });
      };
    }, [mapInstance, preservedSelectedGroup, showDebugGroups, gniduData]);

    // Get top groups from API (already sorted and filtered)
    // Only use data when highlighting is enabled
    const topGroups = highlightTopGroups && topGroupsData?.hits?.hits
      ? topGroupsData.hits.hits.filter((g: any) => g._id !== selectedGroup?._id)
      : [];

    // Generate random colors for top groups
    const getRandomColor = (index: number) => {
      const colors = ['#ff6600', '#ff3366', '#33ff66', '#3366ff', '#ff33cc'];
      return colors[index % colors.length];
    };

    // Create lookup map for faster ID matching
    const topGroupsMap = new Map(topGroups.map((g: any, idx: number) => [g._id, idx]));


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
    {selectedGroup && selectedGroup._source?.misc?.children?.length > 0 && filteredChildren.length > 0 && (() => {
      // Collect all unique H3 cell IDs from children
      const h3Cells = new Set<string>();
      filteredChildren.forEach((child: any) => {
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
              // Check for top status when highlighting is enabled
              const topIndexValue = highlightTopGroups ? topGroupsMap.get(group._id) : undefined;
              const topIndex: number = (topIndexValue !== undefined && typeof topIndexValue === 'number') ? topIndexValue : -1;
              const isTopGroup = topIndex !== -1;
              const topColor = isTopGroup ? getRandomColor(topIndex) : '#666';

              // Determine marker size: large for top groups, small for regular groups
              const radius = isSelected ? 5 : isTopGroup ? 5 : 4;
              const weight = isSelected ? 3 : isTopGroup ? 3 : 2;
              const fillOpacity = isSelected ? 0.1 : isTopGroup ? 0.8 : 0.2;
              const color = isSelected ? '#000000' : (isTopGroup ? topColor : '#666');

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
                    click: () => {
                      setSelectedGroup(group);
                      selectedGroupRef.current = group;
                    }
                  }}
                />
              );
            })}

            {showDebugGroups && preservedSelectedGroup && preservedSelectedGroup._source?.misc?.children?.length > 0 && filteredChildren.map((item: any) => {
              // Skip if location or coordinates are missing
              if (!item._source?.location?.coordinates) return null;
              
              const isRoot = item._source.uuid == preservedSelectedGroup._source.misc.root;
              const isSelected = selectedChild === item._id;
              
              const handleMarkerClick = () => {
                setSelectedChild(isSelected ? null : item._id);
                // Scroll to the corresponding list item
                const listItem = childListItemRefs.current.get(item._id);
                if (listItem) {
                  listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              };
              
              // Determine marker styling: root is larger, selected is highlighted
              let radius, color, weight, fillOpacity;
              if (isRoot) {
                radius = isSelected ? 8 : 6;
                color = isSelected ? '#ff6600' : 'red';
                weight = isSelected ? 4 : 3;
                fillOpacity = isSelected ? 0.3 : 0.2;
              } else {
                radius = isSelected ? 6 : 2;
                color = isSelected ? '#ff6600' : 'blue';
                weight = isSelected ? 4 : 2;
                fillOpacity = isSelected ? 0.3 : 0;
              }
              
              return (
                <CircleMarker
                  key={`debug-child-${item._id}`}
                  center={[item._source.location.coordinates[1], item._source.location.coordinates[0]]}
                  radius={radius}
                  pathOptions={{ 
                    color: color, 
                    weight: weight, 
                    opacity: 1, 
                    fillOpacity: fillOpacity 
                  }}
                  eventHandlers={{
                    click: handleMarkerClick
                  }}
                />
              );
            })}

            {/* Group Details & GNIDU Overlay */}
            {showDebugGroups && (preservedSelectedGroup || (gniduData?.hits?.hits?.length > 0)) && (
              <div 
                className="absolute bottom-4 right-4 bg-white/95 border border-gray-300 rounded-lg p-3 max-w-md max-h-[calc(100svh-8rem)] overflow-y-auto shadow-lg z-[1000] text-xs font-sans flex flex-col"
                data-debug-overlay
              >
                {/* Selected Group Details */}
                {preservedSelectedGroup && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="font-bold mb-2 text-gray-800">
                      {preservedSelectedGroup._source.label || preservedSelectedGroup._id}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div>

                        <Link href={`/uuid/${preservedSelectedGroup._source.uuid}.json`} className="text-blue-600 hover:underline">
                          Gruppedata
                        </Link>
                      </div>
                      {preservedSelectedGroup._source.misc?.root && (
                        <div>
                          
                          <Link href={`/uuid/${preservedSelectedGroup._source.misc?.root}`} className="text-blue-600 hover:underline">
                          Root
                          </Link>
                        </div>
                      )}
                      {preservedSelectedGroup._source?.misc?.child_count !== undefined && (
                        <div>
                          <b>UUID count:</b> {preservedSelectedGroup._source.misc?.child_count}
                        </div>
                      )}
                      {preservedSelectedGroup._source?.misc?.h3_count !== undefined && (
                        <div>
                          <b>H3 count:</b> {preservedSelectedGroup._source.misc.h3_count}
                        </div>
                      )}
                    </div>
                    {/* Filter Chips */}
                    {(snidParam || wikidataParam || ssrParam || geonamesParam) && (
                      <div className="mt-3 mb-2">
                        <div className="text-xs text-gray-600 mb-1">Active filters:</div>
                        <div className="flex flex-wrap gap-1">
                          {snidParam && (
                            <Clickable
                              remove={['snid']}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
                            >
                              <span>SNID: {snidParam}</span>
                              <PiX className="text-sm" />
                            </Clickable>
                          )}
                          {wikidataParam && (
                            <Clickable
                              remove={['wikidata']}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
                            >
                              <span>Wikidata: {wikidataParam}</span>
                              <PiX className="text-sm" />
                            </Clickable>
                          )}
                          {ssrParam && (
                            <Clickable
                              remove={['ssr']}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
                            >
                              <span>SSR: {ssrParam}</span>
                              <PiX className="text-sm" />
                            </Clickable>
                          )}
                          {geonamesParam && (
                            <Clickable
                              remove={['geonames']}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 transition-colors"
                            >
                              <span>Geonames: {geonamesParam}</span>
                              <PiX className="text-sm" />
                            </Clickable>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Children List */}
                    {preservedSelectedGroup._source?.misc?.children?.length > 0 && filteredChildren.length > 0 && (
                      <div className="mt-3">
                        <b>Children:</b>
                        <ul className="mt-1 max-h-48 overflow-y-auto pl-2 pr-2">
                          {filteredChildren.map((item: any) => {
                            const isRoot = item._source.uuid == preservedSelectedGroup._source.misc.root;
                            const isSelected = selectedChild === item._id;
                            
                            const handleListItemClick = (e: React.MouseEvent) => {
                              e.preventDefault();
                              setSelectedChild(isSelected ? null : item._id);
                            };
                            
                            return (
                            <li 
                              key={item._id} 
                              ref={(el) => {
                                if (el) {
                                  childListItemRefs.current.set(item._id, el);
                                } else {
                                  childListItemRefs.current.delete(item._id);
                                }
                              }}
                              className={`truncate mb-1 cursor-pointer rounded px-1 py-0.5 transition-colors ${
                                isSelected ? 'bg-orange-200' : 'hover:bg-gray-100'
                              }`}
                              onClick={handleListItemClick}
                            >
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedChild(isSelected ? null : item._id);
                                  }}
                                  className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
                                    isSelected 
                                      ? 'bg-orange-500 border-orange-700' 
                                      : isRoot
                                      ? 'bg-red-500 border-red-700 hover:bg-red-600'
                                      : 'bg-blue-500 border-blue-700 hover:bg-blue-600'
                                  }`}
                                  title="Highlight marker on map"
                                  aria-label="Highlight marker on map"
                                />
                                <Link
                                  href={`/uuid/${item._source.uuid}`}
                                  className={`${isSelected ? 'text-orange-800 font-bold' : 'text-blue-600'} hover:underline font-semibold flex-1`}
                                  title={item._source.label || item._id}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item._source.label || item._id}  
                                </Link>{item._index.split('-')[2]}
                              </div>
                              <div className="text-xs mt-0.5 pl-2 flex flex-wrap gap-x-2 gap-y-1">
                                {/* SNID */}
                                {item._source.snid && (
                                  
                                    <Clickable add={{snid: item._source.snid}} className="hover:underline">
                                      {item._source.snid}
                                    </Clickable>
                                  
                                )}
                                {/* SSR */}
                                {item._source.ssr && (
                                  <span>
                                    <span className="text-gray-500">SSR:</span>{" "}
                                    <a
                                      href={`https://stadnamn.kartverket.no/fakta/${item._source.ssr}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {item._source.ssr}
                                    </a>
                                  </span>
                                )}
                                {/* Wikidata */}
                                {item._source.wikidata && (
                                  <span>
                                    <span className="text-gray-500">Wikidata:</span>{" "}
                                    <a
                                      href={`https://www.wikidata.org/wiki/${item._source.wikidata}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {item._source.wikidata}
                                    </a>
                                  </span>
                                )}
                                {/* Geonames */}
                                {item._source.geonames && (
                                  <span>
                                    <span className="text-gray-500">Geonames:</span>{" "}
                                    <a
                                      href={`https://www.geonames.org/${item._source.geonames}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {item._source.geonames}
                                    </a>
                                  </span>
                                )}
                              </div>
                            </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {/* GNIDU List */}
                {gniduData?.hits?.hits?.length > 0 && (
                  <div>
                    <div className="font-bold mb-2 text-gray-800">
                      GNIDU
                    </div>
                    {gniduData.hits.hits.map((item: any) => {
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
                    {!preservedSelectedGroup && (
                      <div className="mt-3 text-xs text-gray-600 text-center italic">
                        Click to select/deselect
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Debug Results Menu */}
            {showDebugGroups && sortedGroups?.hits?.hits && sortedGroups.hits.hits.length > 0 && (
              <div 
                className="absolute left-4 top-[25svh] bottom-1 bg-white/95 border border-gray-300 rounded-lg p-3 w-64 max-h-[calc(100svh-6rem)] overflow-y-auto shadow-lg z-[1000] text-xs font-sans flex flex-col"
                data-debug-overlay
              >
                <div className="font-bold mb-2 text-gray-800">
                  Debug Groups ({sortedGroups.hits.hits.length})
                </div>
                <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="debug-groups-sort" className="text-xs text-gray-700">
                      Sorter etter:
                    </label>
                    <select
                      id="debug-groups-sort"
                      value={debugGroupsSortBy}
                      onChange={(e) => setDebugGroupsSortBy(e.target.value as 'uuid' | 'uuid_count' | 'h3_count')}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="uuid">UUID (tilfeldig fordeling)</option>
                      <option value="uuid_count">UUID-antall (child count)</option>
                      <option value="h3_count">H3-antall</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={highlightTopGroups}
                      onChange={() => setHighlightTopGroups(!highlightTopGroups)}
                      className="accent-accent-800"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Fremhev topp i kart</span>
                  </label>
                </div>
                <div className="flex-1 overflow-y-auto">
                {sortedGroups.hits.hits.map((group: any) => {
                  const isSelected = group._id === preservedSelectedGroup?._id;
                  const topIndexValue = highlightTopGroups ? topGroupsMap.get(group._id) : undefined;
                  const topIndex: number = (topIndexValue !== undefined && typeof topIndexValue === 'number') ? topIndexValue : -1;
                  const isTopGroup = topIndex !== -1;
                  const topColor = isTopGroup ? getRandomColor(topIndex) : undefined;
                  return (
                    <div
                      key={`debug-result-${group._id}`}
                      className={`p-2 my-1 rounded cursor-pointer transition-colors ${
                        isSelected ? 'bg-black text-white' : isTopGroup ? 'bg-gray-100' : 'bg-gray-50 hover:bg-blue-100'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedGroup(null);
                          selectedGroupRef.current = null;
                        } else {
                          setSelectedGroup(group);
                          selectedGroupRef.current = group;
                        }
                      }}
                    >
                      <div className={`font-semibold truncate ${isTopGroup && !isSelected ? '' : ''}`} style={isTopGroup && !isSelected ? { color: topColor } : {}}>
                        {isTopGroup && !isSelected && topIndex >= 0 && `#${topIndex + 1} `}
                        {group._source?.label || group._id}
                      </div>
                      {group._source?.misc?.child_count !== undefined && (
                        <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                          UUID: {group._source.misc.child_count} | H3: {group._source.misc.h3_count || 0}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}
            </>
}