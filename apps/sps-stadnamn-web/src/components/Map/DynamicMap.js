'use client'
import { useEffect, useState, useRef } from 'react';
import Leaflet from 'leaflet';
import { TileLayer, Marker, MapContainer, Popup} from 'react-leaflet';
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
      fetch('http://localhost:9200/hordanamn_geojson/_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          size: 200,
          query: {
            bool: {
              must: [
                {
                  geo_bounding_box: {
                    "geometry": {
                      top_left: {
                        lat: bounds.getNorthEast().lat,
                        lon: bounds.getSouthWest().lng
                      },
                      bottom_right: {
                        lat: bounds.getSouthWest().lat,
                        lon: bounds.getNorthEast().lng
                      }
                    }
                  }
                },
                ...nameQuery ? [{
                    simple_query_string: {
                      query: nameQuery,
                      fields: ["name"],
                      default_operator: "and"
                    
                  }
                }] : []
              ]
            }
          }
        })
      })
      .then(response => response.json())
      .then(data => {

        console.log(data)
        
        setMarkers(data.hits.hits)})
      .catch(error => console.error('Error:', error));
    }
  }, [bounds, nameQuery]);

  useEffect(() => {
    (async function init() {
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
        iconUrl: 'leaflet/images/marker-icon.png',
        shadowUrl: 'leaflet/images/marker-shadow.png',
      });
    })();
  }, []);

  return (
    <MapContainer ref={mapRef} whenReady={onMapLoaded} style={{width: '100%', height: '100%'}}  width="800" height="400" center={DEFAULT_CENTER} zoom={6}>
                  <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {markers.map((marker, index) => (
              <Marker key={index} position={[marker._source.geometry[1], marker._source.geometry[0]]}>
                <Popup>
                  {marker._source.name}
                </Popup>
              </Marker>
            ))}
    </MapContainer>
  )
}

export default Map;
