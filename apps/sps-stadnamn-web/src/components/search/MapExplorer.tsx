import { useCallback, useRef, useState } from "react";
import Map from "../Map/Map";
import { baseMapKeys, baseMapNames, baseMaps } from "@/config/basemap-config";
import { PiGps, PiGpsFill, PiMagnifyingGlassMinus, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlus, PiMagnifyingGlassPlusFill } from "react-icons/pi";
import IconButton from "../ui/icon-button";

export default function MapExplorer({isMobile}: {isMobile: boolean}) {

    const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);
    const controllerRef = useRef(new AbortController());

    const mapInstance = useRef<any>(null);;



  const mapRef = useCallback((node: any) => {
        if (node !== null) {
        mapInstance.current = node;

        node.on('baselayerchange', (layer: any) => {
            const layerCode = baseMapKeys[baseMapNames.indexOf(layer.name)]
            localStorage.setItem('baseLayer', layerCode);
            setLayerControlCollapsed(true);
        });

        }

    }, []);

    const zoomIn = () => {
        if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom();
            mapInstance.current.setZoom(currentZoom + 1);
        }
    };
    
    const zoomOut = () => {
        if (mapInstance.current) {
            const currentZoom = mapInstance.current.getZoom();
            mapInstance.current.setZoom(currentZoom - 1);
        }
    };

    function getMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Assuming mapInstance is a ref to your map instance
                    mapInstance.current.setView([latitude, longitude], 13); // Zoom level 13 is just an example
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

 
    return <><Map mapRef={mapRef} zoom={0} center={[59.91, 10.75]} zoomControl={false}
        className='w-full h-full'>
    {({ TileLayer, LayersControl, CircleMarker, Marker, Popup, Tooltip }: any, leaflet: any) => (

  <>

   <LayersControl collapsed={layerControlCollapsed} position={isMobile? 'topright' : 'bottomright'}>
   <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == baseMaps[0].key || !localStorage.getItem('baseLayer') || !baseMapKeys.includes(localStorage.getItem('baseLayer'))} name={baseMapNames[0]}>
      <TileLayer key={baseMaps[0].key} {...baseMaps[0].props} />
    </LayersControl.BaseLayer>
    {baseMaps.slice(1).map((item, index) => (
      <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == item.key} key={item.key} name={item.name}>
        <TileLayer key={item.key} {...item.props} />
      </LayersControl.BaseLayer>
    ))
    }
    </LayersControl>



    </>
    )}
</Map>
<div className={`absolute ${isMobile ? 'top-24 right-0 flex-col p-2 gap-4' : 'bottom-0 w-full'} flex justify-center p-2 gap-2 text-white z-[3001]`}>
    <IconButton onClick={zoomIn}  className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
    <IconButton onClick={zoomOut} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
    <IconButton onClick={getMyLocation} className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Min posisjon"><PiGps/></IconButton>
</div>
</>
}