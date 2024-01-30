'use client'
import { useEffect, useState, useRef } from 'react';
import Map from './Map'
import { useSearchParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [60.3913, 5.3221];
const DEFAULT_ZOOM = 6;

export default function MapExplorer(props) {

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const searchParams = useSearchParams()
  const nameQuery = searchParams.get('q')

  const onMapLoaded = (mapInstance) => {
    setBounds(mapInstance.target.getBounds());
  };

  useEffect(() => {
    if (mapRef.current) {
        if (props.mapBounds.length) {
            mapRef.current.fitBounds(props.mapBounds, {maxZoom: 8})
        }
      //mapRef.current.setView(props.center || DEFAULT_CENTER, props.bounds.length ? mapRef.current.getBoundsZoom(props.bounds) : DEFAULT_ZOOM);
    }
  }, [mapRef.current, props.center, props.mapBounds]);

  useEffect(() => {
    // Check if the map is initialized
    if (mapRef.current) {
      
      // Update the bounds state when the map's view changes
      mapRef.current.on('moveend', () => {
        const newBounds = mapRef.current.getBounds();
        setBounds(newBounds);
      });
    }
  }, [mapRef.current]);


  useEffect(() => {
    // Check if the bounds are initialized
    if (bounds) {
      // Fetch data based on the new bounds
      const query = `/api/geo?dataset=hord&topLeftLat=${bounds.getNorthEast().lat}&topLeftLng=${bounds.getSouthWest().lng}&bottomRightLat=${bounds.getSouthWest().lat}&bottomRightLng=${bounds.getNorthEast().lng}${searchParams.get('q') ? `&q=${searchParams.get('q')}` : ''}`
      console.log("QUERY", query)
      fetch(query, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

      })
      .then(response => response.json())
      .then(data => {

        //console.log("GEO DATA", data)
        
        setMarkers(data.hits.hits)})
      .catch(error => console.error('Error:', error));
    }
  }, [bounds, nameQuery]);



  return (
    <Map mapRef={mapRef} whenReady={onMapLoaded} zoom={DEFAULT_ZOOM}>
            {({ TileLayer, CircleMarker, ChangeView }: {}) => (
                <>
            <TileLayer
              url="https://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              subdomains={['', '2', '3']} 
            />
            
            {markers.map((marker, index) => (
              <CircleMarker pathOptions={{color:'white', weight: 2, opacity: 1, fillColor: 'black', fillOpacity: 1}}
                            key={index} center={[marker.fields.location[0].coordinates[1], marker.fields.location[0].coordinates[0]]} radius={7}>

              </CircleMarker>
                
            ))}
            </>
            )}
    </Map>
  )
}

