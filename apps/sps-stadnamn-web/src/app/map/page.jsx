'use client'
import { useRef } from 'react';
import Map from '@/components/Map/Map';
import 'leaflet/dist/leaflet.css';
export default function MapExplorer() {

    const mapRef = useRef(null)
    // Geographic ounds of Nowray
    const bounds = [[57.5, 3.5], [71.5, 31.5]]




  return (
    <div className="h-full w-full">
      
    <Map mapRef={mapRef} className='w-full h-full' bounds={bounds}>
            {({ TileLayer, LayersControl, CircleMarker, Marker, Popup, Tooltip }, leaflet) => (

          <>
           <TileLayer
                key="map_cartodb"
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
           <LayersControl collapsed={false}>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_topo4'} name="Norgeskart">
              <TileLayer
                key="map_topo4"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_topo4graatone'} name="Norgeskart, gråtoner">
              <TileLayer
                key="map_topo4graatone"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4graatone&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_terreng'} name="Terrengkart">
              <TileLayer
                key="map_terreng"
                url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=terreng_norgeskart&zoom={z}&x={x}&y={y}"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                subdomains={['', '2', '3']}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == 'map_carto_labels'} name="Verdenskart">
              <TileLayer
                key="map_carto_labels"
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
            </LayersControl.BaseLayer>
            </LayersControl>

            



            </>
            )}
    </Map>
    </div>
  )
}

