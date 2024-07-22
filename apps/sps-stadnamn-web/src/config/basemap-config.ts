/*
          <>
           <TileLayer
                key={baseMaps[0].code}
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
           <LayersControl collapsed={layerControlCollapsed} >
           <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == tileMapCodes[0] || !localStorage.getItem('baseLayer') || !tileMapCodes.includes(localStorage.getItem('baseLayer'))} name={tileMapNames[0]}>
              <TileLayer key={tileMapCodes[0]
                            attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
                            url="https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png"/>
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == tileMapCodes[1]} name={tileMapNames[1]}>
              <TileLayer
                key={tileMapCodes[1]}
                url="https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == tileMapCodes[2]} name={tileMapNames[2]}>
              <TileLayer
                key={tileMapCodes[2]}
                url="https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png"
                attribution="<a href='http://www.kartverket.no/'>Kartverket</a>"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={localStorage.getItem('baseLayer') == tileMapCodes[3] } name={tileMapNames[3]}>
              <TileLayer
                key={tileMapCodes[3]}
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>"
              />
            </LayersControl.BaseLayer>
            </LayersControl>

*/
export const backgroundMap = {
        url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>'
}

export const baseMaps: Record<string, any>[] = [
    {
        key: 'topo', 
        name: 'Norgeskart', 
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
            attribution: '<a href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'topograatone',
        name: 'Norgeskart, gråtone',
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
            attribution: '<a href="http://www.kartverket.no/">Kartverket</a>'
        }
        
    },
    {
        key: 'toporaster', 
        name: 'Norgeskart, store bokstaver', 
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png',
            attribution: '<a href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'word_map_labels',
        name: 'Verdenskart',
        props: {
            url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors &copy; <a href=&quot;https://carto.com/attributions&quot;>CARTO</a>'
        }
        
    }
];


export const baseMapNames = baseMaps.map(baseMap => baseMap.name);
export const baseMapKeys = baseMaps.map(baseMap => baseMap.key);
// Object where key is the baseMap key and value is the props object
export const baseMapProps = baseMaps.reduce((acc, baseMap) => {
    acc[baseMap.key] = baseMap.props;
    return acc;
}, {});

