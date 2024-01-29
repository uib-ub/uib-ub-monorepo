'use client'
import { useEffect, useState, useRef } from 'react';
import Leaflet from 'leaflet';
import { TileLayer, Marker, CircleMarker, MapContainer, Popup} from 'react-leaflet';
import { useSearchParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [60.3913, 5.3221];

const Map = () => {

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const searchParams = useSearchParams()
  const nameQuery = searchParams.get('q')

  const onMapLoaded = (mapInstance) => {
    setBounds(mapInstance.target.getBounds());
  };

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
      const query = `/api/geo?dataset=hord&topLeftLat=${bounds.getNorthEast().lat}&topLeftLng=${bounds.getSouthWest().lng}&bottomRightLat=${bounds.getSouthWest().lat}&bottomRightLng=${bounds.getNorthEast().lng}&q=${searchParams.get('q')}`
      console.log("QUERY", query)
      fetch(query, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

      })
      .then(response => response.json())
      .then(data => {

        console.log("GEO DATA", data)
        
        setMarkers(data.hits.hits)})
      .catch(error => console.error('Error:', error));
    }
  }, [bounds, nameQuery]);



  return (
    <MapContainer ref={mapRef} whenReady={onMapLoaded} style={{width: '100%', height: '100%'}}  width="800" height="400" center={DEFAULT_CENTER} zoom={6}>
                  <TileLayer
              url="https://opencache2.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {markers.map((marker, index) => (
              <CircleMarker pathOptions={{color: 'black'}}
                            key={index} center={[marker.fields.location[0].coordinates[1], marker.fields.location[0].coordinates[0]]} radius={5}>
                <Popup>
                  {marker._source.label}
                </Popup>
              </CircleMarker>
                
            ))}
    </MapContainer>
  )
}

export default Map;
