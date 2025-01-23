
export const definedByGeoJSON = {
  name: 'definedByGeoJSON',
  title: 'GeoJSON',
  description: 'Lag et GeoJSON objekt eller lim inn en hel GeoJSON fil.',
  type: 'array',
  of: [
    { type: 'GeojsonFeatureCollection' },
    { type: 'Geojson' }
  ],
};
