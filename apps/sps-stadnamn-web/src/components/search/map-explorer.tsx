import { Fragment, useContext, useEffect, useRef, useState, useCallback } from "react";
import Map from "../map/map";
import { baseMaps, baseMapKeys, baseMapProps, defaultBaseMap } from "@/config/basemap-config";
import { PiCheckCircleFill, PiCornersOut, PiCrop, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiMapPinLineFill, PiNavigationArrowFill,  PiStackSimpleFill } from "react-icons/pi";
import IconButton from "../ui/icon-button";
import { SearchContext } from "@/app/search-provider";
import Spinner from "../svg/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePerspective, useSearchQuery } from "@/lib/search-params";
import { getClusterMarker, getLabelMarkerIcon, getUnlabeledMarker } from "./markers";
import { useSearchParams } from "next/navigation";
import { xDistance, yDistance, getValidDegree } from "@/lib/map-utils";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import * as h3 from "h3-js";
import { useRouter } from "next/navigation";
import wkt from 'wellknown';
import { stringToBase64Url } from "@/lib/utils";
import useDocData from "@/state/hooks/doc-data";
import { useQueries } from "@tanstack/react-query";


export default function MapExplorer() {
  const { resultBounds, totalHits, searchError, setCoordinatesError, isLoading, allowFitBounds, setAllowFitBounds } = useContext(SearchContext)
  const [markerBounds, setMarkerBounds] = useState<[[number, number], [number, number]] | null>()
  const controllerRef = useRef(new AbortController());
  const [baseMap, setBasemap] = useState<null | string>(null)
  const [markerMode, setMarkerMode] = useState<null | string>(null)
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const searchParams = useSearchParams()
  const zoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : null
  const center = searchParams.get('center') ? searchParams.get('center')!.split(',').map(parseFloat) : null
  const [viewResults, setViewResults] = useState<any>(null)
  const { searchQueryString } = useSearchQuery()
  const perspective = usePerspective()
  const details = searchParams.get('details') || 'doc'



  
  const router = useRouter()

  const parent = searchParams.get('parent')
  const doc = searchParams.get('doc')

  
  // NB: cluster mode has sampling within each cluster if many results, and sample mode has clustering of results with the same coordinates.
  // Tiles are only used in cluster mode
  const tiles = viewResults?.aggregations?.clusterSample?.tiles?.buckets || viewResults?.aggregations?.tiles?.buckets


  const maxDocCount = tiles?.reduce((acc: number, cur: any) => Math.max(acc, cur.doc_count), 0);
  const minDocCount = tiles?.reduce((acc: number, cur: any) => Math.min(acc, cur.doc_count), Infinity);

  const setViewUrlParams = useCallback((zoom: number, center?: [number, number]) => {
      const params = new URLSearchParams(searchParams)
      params.set('zoom', zoom.toString())
      if (center && center.length == 2) {
        params.set('center', center.join(','))
      }
      router.replace(`?${params.toString()}`)
    }, [router, searchParams])
  
  
  

  if (searchParams.get('error') == 'true') {
    throw new Error('Simulated client side error');
  }
  const { docData, docLoading } = useDocData()
  
  const mapInstance = useRef<any>(null);
  const autoMode = markerMode === 'auto' ? (searchParams.get('q')?.length && totalHits?.value < 100000 ? 'cluster' : 'sample') : null

  // NB: sample mode, but clustering of results with the same coordinates
  const sampleClusters = useCallback((data: any) => {
    const markers: {topHit: any, grouped: any[], unlabeled: any[]}[] = []

    data.hits.hits.forEach((hit: any) => {
      let added = false;
      const cadastralParent = hit.fields.within?.[0]
      if (cadastralParent?.length && data.hits.hits.some((hit: any) => hit.fields.uuid[0] == cadastralParent)) {
        return
      }

      for (const group of markers) {
        const firstHit = group.topHit
        if (firstHit) {
          const yDist = yDistance(mapInstance.current, firstHit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[1]);
          const xDist = xDistance(mapInstance.current, firstHit.fields.location[0].coordinates[0], hit.fields.location[0].coordinates[0]);
          if (yDist < 2 && xDist < 2) {
            group.grouped.push(hit);
            added = true;
            break;
          }
          if (yDist < 32 && xDist < (64 + (4 * firstHit.fields.label[0].length))) {
            added = true;
            const mapZoom = mapInstance.current?.getZoom()
            if (mapZoom && mapZoom == 18) {
              group.grouped.push(hit);
            }
            else {
              group.unlabeled.push(hit);
            }
          }
        }
      }
      if (!added) {
        markers.push({topHit: hit, grouped: [], unlabeled: []});
      }
    })

    return {...data, hits: {markers}}
  }, [])

  const isTooClose = (hits: any[], map: any) => {
    if (hits.length <= 1) return false;

    return hits.some((hit) => {
      const point = map.latLngToContainerPoint([
        hit.fields.location[0].coordinates[1],
        hit.fields.location[0].coordinates[0]
      ]);

      return hits.some((other) => {
        const otherPoint = map.latLngToContainerPoint([
          other.fields.location[0].coordinates[1],
          other.fields.location[0].coordinates[0]
        ]);
        return Math.abs(point.y - otherPoint.y) < 32;
      });
    });
  };

  

  const coordinatesSelected = (lat: number, lon: number) => {
    return docData?._source?.location?.coordinates[1] == lat && docData?._source?.location?.coordinates[0] == lon
  }

  // Fly to doc
  useEffect(() => {
    if (!mapInstance.current || isLoading ) return
    
      if (doc && docData?._source?.location?.coordinates?.length && docData?._source.uuid == doc) {
        const currentBounds = mapInstance.current.getBounds();
        const center = [docData?._source?.location?.coordinates[1], docData?._source?.location?.coordinates[0]]
          if (currentBounds && !currentBounds.contains(center)) {
            mapInstance.current.setView(center, mapInstance.current.getZoom());
          }
      }

    }, [mapInstance, isLoading, doc, docData])

  // Fly to results

  useEffect(() => {
    const mapBounds = mapInstance.current?.getBounds();
    if (!mapBounds || isLoading || geoLoading || !resultBounds?.length || !allowFitBounds) return
    

    // Check if result bounds are contained in map bounds
    const boundsContained = mapBounds.contains(resultBounds)

    if (boundsContained) {
        // Get zoom levels for both current view and result bounds
        const resultBoundsZoom = mapInstance.current.getBoundsZoom(resultBounds);
        const currentZoom = mapInstance.current.getZoom();
        
        // If current zoom is more than 2 levels out from the result bounds zoom
        if (currentZoom < resultBoundsZoom - 2) {
          setAllowFitBounds(false)
          mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
          setViewUrlParams(resultBoundsZoom, [mapBounds.getCenter().lat, mapBounds.getCenter().lng])
          return
        }
    }

    if (geoLoading) {
      return
    }
    

    if (!tiles && !viewResults?.hits?.markers?.length) {
      setAllowFitBounds(false)
      
      mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
      setViewUrlParams(mapInstance.current.getZoom(), [mapBounds.getCenter().lat, mapBounds.getCenter().lng])
    }
    
    
  }, [resultBounds, allowFitBounds, setAllowFitBounds, isLoading, geoLoading, tiles, viewResults, setViewUrlParams])



  // Function to get tile bounds containing a specific point
  const getTileBoundsForPoint = useCallback((lat: number, lng: number, precision: number) => {
    const n = Math.pow(2, precision);
    
    // Convert lat/lng to tile coordinates
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * n);
    
    // Convert tile coordinates back to lat/lng bounds
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    
    const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    
    const north = (latRad1 * 180) / Math.PI;
    const south = (latRad2 * 180) / Math.PI;
    
    return [[north, west], [south, east]] as [[number, number], [number, number]];
  }, []);
/*
  useEffect(() => {
    // Check if the bounds are initialized
    
    if (!markerBounds?.length || !totalHits || isLoading) {
      return;
    }

    setGeoLoading(true)
    setCoordinatesError(false)
    
    // Get the center of the current viewport
    const [[north, west], [south, east]] = markerBounds;
    const centerLat = (north + south) / 2;
    const centerLng = (east + west) / 2;
    
    // Calculate precision for the current zoom level or use a default
    let precision = 8; // Default fallback
    try {
      precision = calculateGeotilePrecision();
    } catch (e) {
      console.log('Using default precision due to calculation error:', e);
    }
    
    // Get tile bounds containing the center point
    const tileBounds = getTileBoundsForPoint(centerLat, centerLng, precision);
    const [[tileNorth, tileWest], [tileSouth, tileEast]] = tileBounds;
    
    console.log('Using tile bounds for geo query:', tileBounds, 'precision:', precision);
    
    // Fetch data based on the tile bounds instead of viewport bounds
    const queryParams = new URLSearchParams(searchQueryString);
    
    const paddedTopLeftLat = getValidDegree(tileNorth, 90);
    const paddedBottomRightLat = getValidDegree(tileSouth, -90);
    const paddedTopLeftLng = getValidDegree(tileWest, -180);
    const paddedBottomRightLng = getValidDegree(tileEast, 180);

    queryParams.set('topLeftLat', paddedTopLeftLat);
    queryParams.set('topLeftLng', paddedTopLeftLng); 
    queryParams.set('bottomRightLat', paddedBottomRightLat);
    queryParams.set('bottomRightLng', paddedBottomRightLng);
    if (zoom) {
      queryParams.set('zoom', zoom.toString());
    }

    // Both cluster map and sample map use cluster data above zoom 10
    const query = `/api/geo/${autoMode || markerMode}?${queryParams.toString()}&totalHits=${totalHits?.value}`;

    fetch(query, {
      signal: controllerRef.current.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed: ' + response.statusText);
        }
        return response.json(); 
      })
       
      .then(data => {
          setViewResults((autoMode == 'sample' || markerMode == 'sample') ? sampleClusters(data) : data)
      })

      .catch(error => {
        if (error.name != 'AbortError') {
          console.log("NAME", error.name)
          console.log("ERROR", error.stack)
          setCoordinatesError(true)
          setGeoLoading(false)
        }
        
      })
      .finally(() => {
        setGeoLoading(false)
      })

  }, [ markerBounds, searchError, searchQueryString, totalHits, markerMode, parent, perspective, isLoading, autoMode, sampleClusters, setCoordinatesError, resultBounds, zoom]);
*/





  useEffect(() => { 
    if (baseMap === null) {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      if (settings[perspective]?.baseMap && baseMapKeys.includes(settings[perspective].baseMap)) {
        setBasemap(settings[perspective].baseMap)
      } else {
        setBasemap(defaultBaseMap[perspective] || baseMaps[0].key)
        // Remove old format if it exists
        localStorage.removeItem('baseMap')
      }
    } else {
      const storedSettings = localStorage.getItem('mapSettings')
      const settings = storedSettings ? JSON.parse(storedSettings) : {}
      
      settings[perspective] = {
        ...settings[perspective],
        baseMap: baseMap
      }
      
      localStorage.setItem('mapSettings', JSON.stringify(settings))
    }
  }, [baseMap, perspective])

  useEffect(() => { 
    if (markerMode === null) {
      const storedMarkerMode = localStorage.getItem('markerMode')
      if (storedMarkerMode && ['auto', 'cluster', 'sample'].includes(storedMarkerMode)) {
        setMarkerMode(storedMarkerMode)
      }

      else {
        setMarkerMode('auto')
        localStorage.removeItem('markerMode')
      }
    }
    else {
      localStorage.setItem('markerMode', markerMode)
    }
  }, [markerMode])

  /*
  useEffect(() => {
    return
    //console.log("ZOOM", programmaticChange.current)
    if (!programmaticChange.current && center && zoom) {
      mapInstance.current?.setView([center[0], center[1]], zoom)
    }
    programmaticChange.current = false

  }, [zoom, center])
  */



  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    } else {

      setViewUrlParams((zoom || 5) + 1);
    }
  };
  
  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    } else {
      setViewUrlParams(Math.max((zoom || 5) - 1, 1));
      
    }
  };



  function getMyLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Assuming mapInstance is a ref to your map instance
          mapInstance.current.setView([latitude, longitude], 15); // Zoom level 13 is just an example
          setMyLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting the location: ", error);
          // Handle error or notify user here
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Notify user that geolocation is not supported
    }
  }

  const calculateRadius = (docCount: number, maxDocCount: number, minDocCount: number) => {
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

  function adjustBounds(bounds: [[number, number], [number, number]], adjustmentFactor: number): [[number, number], [number, number]] {
    // Calculate the center of the bounds
    const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
    const centerLon = (bounds[0][1] + bounds[1][1]) / 2;

    // Calculate the distance from the center to each corner and apply the adjustment factor
    const latDiff = (bounds[1][0] - bounds[0][0]) * (1 + adjustmentFactor) / 2;
    const lonDiff = (bounds[1][1] - bounds[0][1]) * (1 + adjustmentFactor) / 2;

    // Calculate and return the new bounds
    const newTopLeft: [number, number] = [centerLat - latDiff, centerLon - lonDiff];
    const newBottomRight: [number, number] = [centerLat + latDiff, centerLon + lonDiff];

    return [newTopLeft, newBottomRight];
  }

 




  const selectDocHandler = (selected: Record<string, any>, hits?: Record<string, any>[]) => {
    return {
      click: () => {

        const newQueryParams = new URLSearchParams(searchParams)
        

          newQueryParams.set('doc', selected?.fields?.uuid[0])
          newQueryParams.set('details', details)

          if (selected.fields?.["group.id"]) {
            newQueryParams.set('group', stringToBase64Url(selected.fields["group.id"][0]))
          }
          else {
            newQueryParams.delete('group')
          }

        router.push(`?${newQueryParams.toString()}`)

        if (hits && hits.length > 1) {
          //setSameMarkerList([...hits].sort((a, b) => a.fields.label[0].localeCompare(b.fields.label[0], 'nb')))
        }
        else {
          
          //setSameMarkerList([])
        }
      }
    }
  }

    // Add this state for toggling the grid
    const [showH3Grid, setShowH3Grid] = useState(false);
    const [showGeotileGrid, setShowGeotileGrid] = useState(true);
    
    // State to store debug viewport bounds for real-time updates
    const [debugViewportBounds, setDebugViewportBounds] = useState<[[number, number], [number, number]] | null>(null);
  
    // Function to check if a polygon intersects with a rectangle
    const checkPolygonIntersection = useCallback((polygon: number[][], bounds: [[number, number], [number, number]]) => {
      if (!polygon || !bounds || polygon.length < 4) return false;
      
      const [[rectNorth, rectWest], [rectSouth, rectEast]] = bounds;
      
      // Get polygon bounds
      const polygonLats = polygon.map(p => p[0]);
      const polygonLngs = polygon.map(p => p[1]);
      const polyNorth = Math.max(...polygonLats);
      const polySouth = Math.min(...polygonLats);
      const polyEast = Math.max(...polygonLngs);
      const polyWest = Math.min(...polygonLngs);
      
      // Check if rectangles overlap (simple bounding box intersection)
      return !(rectEast < polyWest || rectWest > polyEast || rectNorth < polySouth || rectSouth > polyNorth);
    }, []);

    // Add state for H3 resolution
    const [h3Resolution, setH3Resolution] = useState(8);

      // Add state for geotile cells and intersecting cells
  const [geotileCells, setGeotileCells] = useState<number[][][]>([]);
  const [intersectingCellIndices, setIntersectingCellIndices] = useState<Set<number>>(new Set());
  const [currentPrecision, setCurrentPrecision] = useState<number>(8); // Store current precision
  const [intersectingCellsBounds, setIntersectingCellsBounds] = useState<[[number, number], [number, number]] | null>(null);


  const geoTileResults = useQueries({
    queries: geotileCells.map((cell, index) => ({
      queryKey: ['geotileCells', cell],
      queryFn: async () => {
        console.log("FETCHING GEOTILE CELL", cell)
        const res = await fetch(`/api/geo/sample?topLeftLat=${cell[0][0]}&topLeftLng=${cell[0][1]}&bottomRightLat=${cell[2][0]}&bottomRightLng=${cell[2][1]}&size=30`)
        if (!res.ok) {
          throw new Error('Failed to fetch geotile cells')
        }
        const data = await res.json()
        return data.hits.hits.map((hit: any) => hit.fields)
      }
    }))
  })

  //console.log("RESULTS", geoTileResults.filter(result => result.isSuccess).map(result => result.data))

  


  // Calculate viewport bounds when zoomed in 2 levels
  const getZoomedInViewport = useCallback(() => {
    if (!mapInstance.current) return null;
    
    const currentZoom = mapInstance.current.getZoom();
    const currentCenter = mapInstance.current.getCenter();
    const currentBounds = mapInstance.current.getBounds();
    
    // Calculate the bounds that would be visible if zoomed in 2 levels
    const zoomedInZoom = currentZoom + 2;
    const zoomRatio = Math.pow(2, 2); // 2^2 for 2 zoom levels
    
    const latSpan = currentBounds.getNorth() - currentBounds.getSouth();
    const lngSpan = currentBounds.getEast() - currentBounds.getWest();
    
    const zoomedLatSpan = latSpan / zoomRatio;
    const zoomedLngSpan = lngSpan / zoomRatio;
    
    const north = currentCenter.lat + zoomedLatSpan / 2;
    const south = currentCenter.lat - zoomedLatSpan / 2;
    const east = currentCenter.lng + zoomedLngSpan / 2;
    const west = currentCenter.lng - zoomedLngSpan / 2;
    
    return [[north, west], [south, east]] as [[number, number], [number, number]];
  }, []);

  // Calculate geotile precision based on viewport size
  const calculateGeotilePrecision = useCallback(() => {
    if (!mapInstance.current) return 8;
    
    const zoomedViewport = getZoomedInViewport();
    if (!zoomedViewport) return 8;
    
    const [[north, west], [south, east]] = zoomedViewport;
    const latSpan = Math.abs(north - south);
    const lngSpan = Math.abs(east - west);
    
    console.log("CALCULATING GEOTILE PRECISION", latSpan, lngSpan)
    // Geotile precision levels and their approximate degree coverage
    // These are rough approximations for grid cell sizes
    const precisionToDegrees = [
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
      { precision: 15, degrees: 0.010986328125 }
    ];
    
    // Find precision where grid cell is larger than or equal to viewport
    const maxSpan = Math.max(latSpan, lngSpan);
    
    for (let i = precisionToDegrees.length - 1; i >= 0; i--) {
      if (precisionToDegrees[i].degrees >= maxSpan) {
        return Math.min(15, precisionToDegrees[i].precision); // Use the exact precision level for smaller cells
      }
    }
    
    return 8; // Default fallback
  }, [getZoomedInViewport]);

  // Function to calculate combined bounds of intersecting cells
  const calculateIntersectingCellsBounds = useCallback((cells: number[][][], intersectingIndices: Set<number>): [[number, number], [number, number]] | null => {
    if (intersectingIndices.size === 0) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    intersectingIndices.forEach(index => {
      const cell = cells[index];
      if (cell) {
        cell.forEach(([lat, lng]) => {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        });
      }
    });
    
    if (minLat === Infinity) return null;
    return [[maxLat, minLng], [minLat, maxLng]];
  }, []);

  // Generate only the intersecting geotile cells
  const getGeotileCells = useCallback((bounds: any) => {
    if (!bounds || !debugViewportBounds) return [];
    
    const [[debugNorth, debugWest], [debugSouth, debugEast]] = debugViewportBounds;
    
    // Use the debug viewport bounds instead of full map bounds
    const n = Math.pow(2, currentPrecision);
    
    // Convert debug viewport bounds to tile coordinates
    const xMin = Math.floor(((debugWest + 180) / 360) * n);
    const xMax = Math.floor(((debugEast + 180) / 360) * n);
    
    // Convert latitude to Web Mercator Y tile coordinates for debug viewport
    const yMin = Math.floor((1 - Math.log(Math.tan((debugNorth * Math.PI) / 180) + 1 / Math.cos((debugNorth * Math.PI) / 180)) / Math.PI) / 2 * n);
    const yMax = Math.floor((1 - Math.log(Math.tan((debugSouth * Math.PI) / 180) + 1 / Math.cos((debugSouth * Math.PI) / 180)) / Math.PI) / 2 * n);
    
    const cells = [];
    const intersectingIndices = new Set<number>();
    let index = 0;
    
    // Generate only the cells that intersect with debug viewport
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        // Convert tile coordinates back to lat/lng bounds
        const tileWest = (x / n) * 360 - 180;
        const tileEast = ((x + 1) / n) * 360 - 180;
        
        const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
        const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
        
        const tileNorth = (latRad1 * 180) / Math.PI;
        const tileSouth = (latRad2 * 180) / Math.PI;
        
        // Create cell polygon
        const cell = [
          [tileNorth, tileWest],
          [tileNorth, tileEast],
          [tileSouth, tileEast],
          [tileSouth, tileWest],
          [tileNorth, tileWest]
        ];
        
        // Add to cells array and track intersecting cells
        cells.push(cell);
        if (checkPolygonIntersection(cell, debugViewportBounds)) {
          intersectingIndices.add(index);
        }
        index++;
      }
    }
    
    // Update the intersecting indices state
    setIntersectingCellIndices(intersectingIndices);
    
    // Calculate and store the combined bounds of intersecting cells
    const combinedBounds = calculateIntersectingCellsBounds(cells, intersectingIndices);
    setIntersectingCellsBounds(combinedBounds);
    
    return cells;
  }, [currentPrecision, debugViewportBounds, checkPolygonIntersection, calculateIntersectingCellsBounds]);

  // Function to check if debug viewport is still within current intersecting cells bounds
  const isDebugViewportWithinIntersectingCells = useCallback((debugBounds: [[number, number], [number, number]]) => {
    if (!intersectingCellsBounds) return false;
    
    const [[debugNorth, debugWest], [debugSouth, debugEast]] = debugBounds;
    const [[boundsNorth, boundsWest], [boundsSouth, boundsEast]] = intersectingCellsBounds;
    
    // Check if debug viewport is completely contained within intersecting cells bounds
    return debugNorth <= boundsNorth && 
           debugSouth >= boundsSouth && 
           debugWest >= boundsWest && 
           debugEast <= boundsEast;
  }, [intersectingCellsBounds]);

  // Function to update geotile cells state based on debug viewport
  const updateGeotileCells = useCallback(() => {
    if (!mapInstance.current) {
      setGeotileCells([]);
      setIntersectingCellIndices(new Set());
      setIntersectingCellsBounds(null);
      return;
    }
    
    const bounds = mapInstance.current.getBounds();
    const cells = getGeotileCells(bounds);
    setGeotileCells(cells);
    console.log("GEOTILE CELLS", cells)
  }, [getGeotileCells]);

  // Smart update that only recalculates when debug viewport leaves intersecting cells bounds
  const updateGeotileCellsIfNeeded = useCallback((newDebugBounds: [[number, number], [number, number]]) => {
    // Always update if we don't have current intersecting cells bounds yet
    if (!intersectingCellsBounds) {
      updateGeotileCells();
      return;
    }
    
    // Check if debug viewport is still within current intersecting cells bounds
    if (!isDebugViewportWithinIntersectingCells(newDebugBounds)) {
      // Debug viewport has left the current intersecting cells bounds - update immediately
      updateGeotileCells();
    }
    // If still within bounds, no update needed - performance optimization!
  }, [intersectingCellsBounds, isDebugViewportWithinIntersectingCells, updateGeotileCells]);

  // Smart viewport bounds update with instant geotile cell updates when needed
  const updateDebugViewportBounds = useCallback((bounds: [[number, number], [number, number]]) => {
    // Always update debug viewport bounds instantly (no throttling)
    setDebugViewportBounds(bounds);
    
    // Smart update: only recalculate cells if viewport has left current intersecting cells bounds
    updateGeotileCellsIfNeeded(bounds);
  }, [updateGeotileCellsIfNeeded]);

  // Update geotile cells immediately when grid visibility changes
  useEffect(() => {
    if (showGeotileGrid) {
      // Ensure we have a valid precision before showing the grid
      if (mapInstance.current && currentPrecision === 8) {
        const initialPrecision = calculateGeotilePrecision();
        setCurrentPrecision(initialPrecision);
      }
      updateGeotileCells();
    } else {
      setGeotileCells([]);
      setIntersectingCellIndices(new Set());
      setIntersectingCellsBounds(null);
    }
  }, [showGeotileGrid, updateGeotileCells, calculateGeotilePrecision, currentPrecision]);


  // No cleanup needed for the new smart update system

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
  }, [h3Resolution]);

  // Function to convert geotile key to bounds
  const geotileKeyToBounds = useCallback((key: string) => {
    console.log('Converting geotile key:', key);
    const parts = key.split('/');
    if (parts.length !== 3) {
      console.log('Invalid key format:', key, 'parts:', parts);
      return null;
    }
    
    const zoom = parseInt(parts[0]);
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);
    
    console.log('Tile coordinates:', { zoom, x, y });
    
    // Web Mercator tile bounds calculation (same as used by most web mapping services)
    const n = Math.pow(2, zoom);
    
    // Longitude bounds
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    
    // Latitude bounds using Web Mercator inverse
    const latRad1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const latRad2 = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    
    const north = (latRad1 * 180) / Math.PI;
    const south = (latRad2 * 180) / Math.PI;
    
    const bounds = [[north, west], [south, east]] as [[number, number], [number, number]];
    console.log('Calculated bounds:', bounds);
    return bounds;
  }, []);

  return <>
    {(!isLoading || markerBounds || (center && zoom) || searchError) ? <>
      <Map        
        whenReady={(e: any) => {
            const currentBounds = e.target.getBounds();
            const center = currentBounds.getCenter();
            const currentZoom = e.target.getZoom();
            
            setMarkerBounds([[currentBounds.getNorth(), currentBounds.getWest()], [currentBounds.getSouth(), currentBounds.getEast()]]);
            
            if (!mapInstance.current) {
              mapInstance.current = e.target;
              // Calculate and set initial precision when map is first ready
              const initialPrecision = calculateGeotilePrecision();
              setCurrentPrecision(initialPrecision);

              // Calculate initial debug viewport bounds (zoomed in 2 levels)
              const zoomRatio = Math.pow(2, 2); // 2^2 for 2 zoom levels
              const latSpan = currentBounds.getNorth() - currentBounds.getSouth();
              const lngSpan = currentBounds.getEast() - currentBounds.getWest();
              const zoomedLatSpan = latSpan / zoomRatio;
              const zoomedLngSpan = lngSpan / zoomRatio;
              
              const north = center.lat + zoomedLatSpan / 2;
              const south = center.lat - zoomedLatSpan / 2;
              const east = center.lng + zoomedLngSpan / 2;
              const west = center.lng - zoomedLngSpan / 2;
              
              setDebugViewportBounds([[north, west], [south, east]]);
            }
            
            setViewUrlParams(currentZoom, [center.lat, center.lng]);
        }}
        zoomControl={false}
        {...center && zoom ?
          { center, zoom }
          : { bounds: resultBounds || [[72, -5], [54, 25]] }
        }
        className='w-full h-full'>
        {({ TileLayer, CircleMarker, Marker, useMapEvents, useMap, Rectangle, Polygon }: any, leaflet: any) => {

          function EventHandlers() {
            const map = useMap();

            useMapEvents({
              move: () => {
                // Update debug viewport bounds during move for real-time updates
                const bounds = map.getBounds();
                const center = bounds.getCenter();
                const currentZoom = map.getZoom();
                
                // Calculate the bounds that would be visible if zoomed in 2 levels
                const zoomRatio = Math.pow(2, 2); // 2^2 for 2 zoom levels
                const latSpan = bounds.getNorth() - bounds.getSouth();
                const lngSpan = bounds.getEast() - bounds.getWest();
                const zoomedLatSpan = latSpan / zoomRatio;
                const zoomedLngSpan = lngSpan / zoomRatio;
                
                const north = center.lat + zoomedLatSpan / 2;
                const south = center.lat - zoomedLatSpan / 2;
                const east = center.lng + zoomedLngSpan / 2;
                const west = center.lng - zoomedLngSpan / 2;
                
                updateDebugViewportBounds([[north, west], [south, east]]);
              },
              zoomend: () => {
                // Update precision when zoom level changes
                const newPrecision = calculateGeotilePrecision();
                if (newPrecision !== currentPrecision) {
                  setCurrentPrecision(newPrecision);
                  // Force update geotile cells when precision changes
                  setIntersectingCellsBounds(null); // Reset bounds to force recalculation
                }
              },
              moveend: () => {
                controllerRef.current.abort();
                controllerRef.current = new AbortController();
                const bounds = map.getBounds();
                const boundsCenter = bounds.getCenter();
                console.log("MOVE END")
                setViewUrlParams(map.getZoom(), [boundsCenter.lat, boundsCenter.lng])
                //setMarkerBounds([[bounds.getNorth(), bounds.getWest()], [bounds.getSouth(), bounds.getEast()]]);
              },
            })         
            return null
          }


          return (

            <>
              <EventHandlers />
              {baseMap && <TileLayer maxZoom={18} maxNativeZoom={18} {...baseMapProps[baseMap]} />}

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

              {/* Draw geotile query results */}
              {showGeotileGrid && geoTileResults.filter(result => result.isSuccess).map(result => result.data).map((dataArray, index) => {
                if (dataArray?.length > 0) {
                  // Calculate center point for the cell
                  const cell = geotileCells[index];
                  const lats = cell.map(p => p[0]);
                  const lngs = cell.map(p => p[1]);
                  const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
                  const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;

                  return (
                    <Fragment key={`result-group-${index}`}>
                      {/* Individual result markers with labels */}
                      {dataArray.map((item: any) => (
                        <Marker
                          key={`result-${item.uuid?.[0] || Math.random()}`}
                          position={[item.location?.[0]?.coordinates?.[1], item.location?.[0]?.coordinates?.[0]]}
                          icon={new leaflet.DivIcon(getLabelMarkerIcon(item.label?.[0] || 'Unknown', 'black', undefined, true))}
                          riseOnHover={true}
                          eventHandlers={selectDocHandler(item)}
                        />
                      ))}
                    </Fragment>
                  );
                }
                return null;
              })}

              {/* Add Geotile grid overlay */}
              {showGeotileGrid && geotileCells.map((polygon, index) => {
                // Check if this cell intersects with the debug viewport using efficient index lookup
                const intersectsViewport = intersectingCellIndices.has(index);
                
                // Calculate the lower-right corner position for text label
                const polygonLats = polygon.map(p => p[0]);
                const polygonLngs = polygon.map(p => p[1]);
                const polyNorth = Math.max(...polygonLats);
                const polySouth = Math.min(...polygonLats);
                const polyEast = Math.max(...polygonLngs);
                const polyWest = Math.min(...polygonLngs);
                
                // Position text slightly inside the lower-right corner
                const textLat = polySouth + (polyNorth - polySouth) * 0.1;
                const textLng = polyEast - (polyEast - polyWest) * 0.1;
                
                return (

                    <Polygon
                      key={`geotile-${index}`}
                      positions={polygon}
                      pathOptions={{
                        color: intersectsViewport ? '#00ff00' : '#ff6600',
                        weight: intersectsViewport ? 3 : 2,
                        opacity: intersectsViewport ? 1 : 0.8,
                        fillOpacity: intersectsViewport ? 0.2 : 0.05,
                        dashArray: intersectsViewport ? '5, 5' : '10, 5'
                      }}
                    />
                );
              })}

              {/* Visualize tiles from fetched results - only when geotile debugging is enabled */}
              {false && showGeotileGrid && (() => {
                console.log('Tiles data:', tiles);
                if (!tiles) {
                  console.log('No tiles data available');
                  return null;
                }
                console.log('Number of tiles:', tiles.length);
                
                return tiles.map((bucket: any, index: number) => {
                  console.log('Processing bucket:', bucket);
                  
                  // Fallback to viewport bounds if geotile key conversion fails
                  let tileBounds = null;
                  
                  if (bucket.key) {
                    tileBounds = geotileKeyToBounds(bucket.key);
                  }
                  
                  if (!tileBounds && bucket.viewport?.bounds) {
                    console.log('Using viewport bounds as fallback for bucket:', bucket.key);
                    tileBounds = [
                      [bucket.viewport.bounds.top_left.lat, bucket.viewport.bounds.top_left.lon],
                      [bucket.viewport.bounds.bottom_right.lat, bucket.viewport.bounds.bottom_right.lon]
                    ];
                  }
                  
                  if (!tileBounds) {
                    console.log('No bounds available for bucket:', bucket.key);
                    return null;
                  }
                  
                  console.log('Rendering tile with bounds:', tileBounds);
                  
                  return (
                    <Rectangle
                      key={`result-tile-${bucket.key || index}`}
                      bounds={tileBounds}
                      pathOptions={{
                        color: '#00aa44',
                        weight: 3,
                        opacity: 0.9,
                        fillOpacity: 0.2,
                        dashArray: '5, 5'
                      }}
                    />
                  );
                });
              })()}

                {/* Add debug viewport rectangle (zoomed in 2 levels) */}
              {showGeotileGrid && mapInstance.current && debugViewportBounds && (
                <Rectangle 
                  bounds={debugViewportBounds}
                  pathOptions={{ 
                    color: '#ff0066', 
                    weight: 3,
                    fillOpacity: 0.1,
                    dashArray: '15, 10'
                  }}
                />
              )}


              {true ? null : markerBounds && markerBounds?.length === 2 && (
                <Rectangle 
                  bounds={markerBounds}
                  pathOptions={{ 
                    color: '#ff0000', 
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {true ? null : resultBounds?.length === 2 && (
                <Rectangle 
                  bounds={resultBounds}
                  pathOptions={{ 
                    color: '#ff0000', 
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {!parent && (markerMode == 'sample' || autoMode == 'sample') && viewResults?.hits?.markers?.map((marker: any) => {
                return <Fragment key={marker.topHit._id}>
                 {![marker.topHit, ...marker.grouped].some((item: any) => coordinatesSelected(item.fields.location[0].coordinates[1], item.fields.location[0].coordinates[0])) ? <Marker key={marker.topHit._id} 
                          position={[marker.topHit.fields.location[0].coordinates[1], marker.topHit.fields.location[0].coordinates[0]]} 
                          icon={new leaflet.DivIcon(getLabelMarkerIcon(marker.topHit.fields.label, 'black', marker.grouped.length ? marker.grouped.length +1 : undefined, true))} 
                          riseOnHover={true} 
                          eventHandlers={selectDocHandler(marker.topHit, [marker.topHit, ...marker.grouped])} />
                          : null}
                  
                  {marker.unlabeled.map((hit: any) => <CircleMarker key={hit._id} center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} radius={5} pathOptions={{ color: 'white', weight: 2, fillColor: 'black', fillOpacity: 0.8 }} eventHandlers={selectDocHandler(hit)} />)}
                </Fragment>
              })}

              {!parent && (markerMode == 'cluster' || autoMode == 'cluster' ) && tiles?.map((bucket: any) => {

                // Sort bucket by children length if dataset is search

                const latitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[1]);
                const longitudes = bucket.docs.hits.hits.map((hit: { fields: { location: { coordinates: any[]; }[]; }; }) => hit.fields.location[0].coordinates[0]);

                const latSum = latitudes.reduce((acc: any, cur: any) => acc + cur, 0);
                const lonSum = longitudes.reduce((acc: any, cur: any) => acc + cur, 0);

                const hitCount = bucket.docs.hits.hits.length;
                const lat = latSum / hitCount;
                const lon = lonSum / hitCount;


                // Check if any of the points are within 32 pixels of each other on the y axis. Use "some" to return the first hit
                const tooClose = isTooClose(bucket.docs.hits.hits, mapInstance.current);

                const labels = bucket.docs.hits.hits.map((hit: { fields: { label: any; }; }) => hit.fields.label[0]);
                const allLabelsSame = labels.every((label: any, index: number, array: any[]) => label === array[0]);

                

                if (bucket.docs?.hits?.hits?.length > 1 && tooClose && bucket.doc_count == bucket.docs?.hits?.hits?.length && (allLabelsSame || (zoom && zoom > 10)) || (zoom && zoom == 18 && bucket.doc_count != bucket.docs?.hits?.hits?.length)) { //} &&bucket.docs?.hits?.hits?.length > 1 && bucket.doc_count == bucket.docs?.hits?.hits?.length && (zoom && zoom > 8) && ((zoom && zoom < 18 && adjustedDeviation > 0 && adjustedDeviation < 0.1) || (!latitudes.some((lat: any) => lat !== latitudes[0]) && !longitudes.some((lon: any) => lon !== longitudes[0])))) {
                  
                  if (bucket.docs?.hits?.hits?.some((hit: any) => coordinatesSelected(hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]))) {
                    // Return blue marker for other hits than doc
                    return <Fragment key={bucket.key}>
                      
                      {bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }) => {
                      
                      const primary = hit.fields.children?.length && hit.fields.children.length > 1
                      
                      return <CircleMarker key={hit._id} 
                                           center={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]} 
                                           radius={primary ? 6 : 4}
                                           fillColor="white"
                                           fillOpacity={1}
                                           color="black"
                                           weight={primary ? 3 : 2}
                                           eventHandlers={selectDocHandler(hit, bucket.docs.hits.hits)}/>
                    })}</Fragment>
                  }
                  else {
                    // Label: add dots if different labels
                  const label = labels[0] + (allLabelsSame ? '' : '...');

                  const icon = new leaflet.DivIcon(getLabelMarkerIcon(label, 'white', bucket.doc_count > 1 ? bucket.doc_count : undefined))

                  return <Marker key={bucket.key} className="drop-shadow-xl" icon={icon} position={[lat, lon]} riseOnHover={true} eventHandlers={selectDocHandler(bucket.docs.hits.hits[0], bucket.docs.hits.hits)} />

                  }


                }
                else if (bucket.doc_count == bucket.docs.hits.hits.length &&  bucket.doc_count < 5 && !tooClose) {  //(false && zoom && zoom > 10) || (bucket.doc_count == 1 || (zoom && (bucket.doc_count == bucket.docs.hits.hits.length || markerMode === 'sample' || (markerMode === 'auto' && searchFilterParamsString?.length)) && adjustedDeviation > 60))) {


                  return <Fragment key={bucket.key}>{bucket.docs?.hits?.hits?.map((hit: { _id: string, fields: { label: any; uuid: string, children?: string[], location: { coordinates: any[]; }[]; }; key: string; }, currentIndex: number) => {
                    
                    const icon = new leaflet.DivIcon(getLabelMarkerIcon(hit.fields.label, 'black', undefined, false, (bucket.doc_count > 2 && (zoom && zoom < 18)) ? true : false))
                    

                  
                    return (docLoading || hit.fields.uuid[0] != doc) && <Marker key={hit._id}
                      position={[hit.fields.location[0].coordinates[1], hit.fields.location[0].coordinates[0]]}
                      icon={icon}
                      riseOnHover={true}
                      eventHandlers={selectDocHandler(hit)}
                    />

                  }
                  )}</Fragment>
                }

                else {
                  // Calculate center of bounds
                  const centerLat = (bucket.viewport.bounds.top_left.lat + bucket.viewport.bounds.bottom_right.lat) / 2;
                  const centerLon = (bucket.viewport.bounds.top_left.lon + bucket.viewport.bounds.bottom_right.lon) / 2;


                  // getClusterMarker(docCount: number, width: number, height: number, fontSize: number) {
                  const clusterIcon = new leaflet.DivIcon(getClusterMarker(bucket.doc_count, //bucket.doc_count, 
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2 + (bucket.doc_count > 99 ? bucket.doc_count.toString().length / 4 : 0),
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 2,
                                                                            calculateRadius(bucket.doc_count, maxDocCount, minDocCount) * 0.8))

                  return <Marker key={bucket.key} position={[(centerLat + lat) / 2, (centerLon + lon) / 2]} icon={clusterIcon}
                    eventHandlers={{
                      click: () => {
                        // If doc count is same as
                        
                        if (bucket.doc_count == bucket.docs.hits.hits.length || (zoom && zoom > 12)) {
                          const newBounds: [[number, number], [number, number]] = [[bucket.viewport.bounds.top_left.lat, bucket.viewport.bounds.top_left.lon], [bucket.viewport.bounds.bottom_right.lat, bucket.viewport.bounds.bottom_right.lon]];
                          // Get zoom level for bounds
                          const boundsZoom = mapInstance.current.getBoundsZoom(newBounds);
                          // Fly to bounds if zoom level is different, otherwise zoom in one level
                          if (boundsZoom != mapInstance.current.getZoom()) {
                            mapInstance.current.flyToBounds(newBounds, { duration: 0.1, maxZoom: 18 });
                          }
                          else {
                            mapInstance.current.setView([(centerLat + lat) / 2, (centerLon + lon) / 2], zoom ? zoom + 1 : 18);
                          }
                        }
                        else {
                          // Go to center of cluster and zoom in two levels
                          mapInstance.current.setView([(centerLat + lat) / 2, (centerLon + lon) / 2], zoom ? zoom + 2 : 18);
                        }
                      }
                    }} />

                }
              }
              )}

              {docData?._source?.area && (
                <Fragment>
                  {(() => {
                    try {
                      const geoJSON = wkt.parse(docData._source.area);
                      if (!geoJSON) return null;

                      // Handle both Polygon and MultiPolygon types
                      const coordinates = geoJSON.type === 'MultiPolygon' 
                        ? (geoJSON as any).coordinates 
                        : [(geoJSON as any).coordinates];

                      return coordinates.map((polygon: number[][][], index: number) => (
                        <Polygon
                          key={`area-${index}`}
                          positions={polygon.map(ring => 
                            // WKT uses [lon, lat] while Leaflet uses [lat, lon]
                            ring.map(([lon, lat]) => [lat, lon])
                          )}
                          pathOptions={{
                            color: '#0066ff',
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.2
                          }}
                        />
                      ));
                    } catch (error) {
                      console.error('Failed to parse WKT:', error);
                      return null;
                    }
                  })()}
                </Fragment>
              )}

              { myLocation && <CircleMarker center={myLocation} radius={10} color="#cf3c3a" />}
              
              { docData?._source?.location?.coordinates?.[1] && doc != parent && docData?._source?.uuid == doc && <Marker 
                  zIndexOffset={1000}
                  position={[
                    docData._source.location.coordinates[1],
                    docData._source.location.coordinates[0]
                  ]} 
                  icon={new leaflet.DivIcon(getLabelMarkerIcon(docData._source.label, 'accent', 0, true))}/>
                }

            </>)
        }}
        

      </Map>
    </> : <div className="flex h-full items-center justify-center">
      <div>
        <Spinner status="Lastar inn kartet" className="w-20 h-20" />
      </div>
    </div>
    }

    <div className={`absolute top-12 lg:top-auto right-0 flex-col lg:flex-row p-2 gap-2 lg:bottom-0 lg:left-1/2 lg:transform lg:-translate-x-1/2 flex justify-center p-2 gap-2 text-white z-[3001]`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Bakgrunnskart" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiStackSimpleFill className="lg:text-xl" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Bakgrunnskart</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {baseMap != null && baseMaps.map((item) => (
            <DropdownMenuItem
              key={item.key}
              onClick={() => setBasemap(item.key)}
              className={`flex items-center py-2 px-4 cursor-pointer justify-between ${baseMap === item.key ? "bg-neutral-100" : ""}`}
              aria-selected={baseMap === item.key}
            >
              {item.name}
              {baseMap === item.key && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Overlegg</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowH3Grid(!showH3Grid)}
            className={`flex items-center py-2 px-4 cursor-pointer justify-between ${showH3Grid ? "bg-neutral-100" : ""}`}
          >
            H3 Rutenett
            {showH3Grid && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
          </DropdownMenuItem>
          {showH3Grid && (
            <div className="px-4 py-2 flex items-center gap-2">
              <button 
                onClick={() => setH3Resolution(Math.max(0, h3Resolution - 1))}
                className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
                disabled={h3Resolution <= 0}
              >
                -
              </button>
              <span className="text-sm">Res: {h3Resolution}</span>
              <button 
                onClick={() => setH3Resolution(Math.min(9, h3Resolution + 1))}
                className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
                disabled={h3Resolution >= 9}
              >
                +
              </button>
            </div>
          )}
          <DropdownMenuItem
            onClick={() => setShowGeotileGrid(!showGeotileGrid)}
            className={`flex items-center py-2 px-4 cursor-pointer justify-between ${showGeotileGrid ? "bg-neutral-100" : ""}`}
          >
            Geotile Rutenett
            {showGeotileGrid && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
          </DropdownMenuItem>
          {showGeotileGrid && (
            <div className="px-4 py-2">
              <div className="text-xs text-neutral-600 mb-1">
                Auto-precision: {currentPrecision}
              </div>
              <div className="text-xs text-neutral-500">
                Rødt rektangel viser zoom +2 nivå
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Markørar" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm cursor-pointer">
            <PiMapPinLineFill className="lg:text-xl" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[4000] bg-white">
          <DropdownMenuLabel>Markørar</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {markerMode != null && (
            <>
              <DropdownMenuItem
                onClick={() => setMarkerMode('auto')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'auto' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'auto'}
              >
                Automatisk
                {markerMode === 'auto' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMarkerMode('cluster')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'cluster' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'cluster'}
              >
                Klynger
                {markerMode === 'cluster' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMarkerMode('sample')}
                className={`flex items-center py-2 px-4 cursor-pointer justify-between ${markerMode === 'sample' ? "bg-neutral-100" : ""}`}
                aria-selected={markerMode === 'sample'}
              >
                Punkter
                {markerMode === 'sample' && <PiCheckCircleFill className="ml-2 text-neutral-800" aria-hidden="true" />}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <IconButton onClick={zoomIn} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn">
        <PiMagnifyingGlassPlusFill className="lg:text-xl" />
      </IconButton>
      <IconButton onClick={zoomOut} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut">
        <PiMagnifyingGlassMinusFill className="lg:text-xl" />
      </IconButton>
      <IconButton onClick={getMyLocation} side="top" className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon">
        <PiNavigationArrowFill className="lg:text-xl" />
      </IconButton>
      <IconButton className="p-2 lg:p-2.5 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom til søkeresultat" onClick={() => {
        if (resultBounds?.length) {
          mapInstance.current?.flyToBounds(resultBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
        }
      }}>
        <PiCrop className="lg:text-xl" />
      </IconButton>
    </div>
  </>
}