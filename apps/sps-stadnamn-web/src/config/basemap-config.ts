// Default bakgrunnskart bør heller endres hvis man søker i et datasett med annen geografisk dekning enn Norge. 
export const backgroundMap = {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}

export const defaultBaseMap: Record<string, string> = {
    all: 'world_map',
    ssr: 'world_map',
    ssr2016: 'world_map'
}

export type MapLayerCoverage = 'global' | 'regional'

export interface BaseMap {
    key: string;
    name: string;
    bright?: boolean;
    coverage: MapLayerCoverage;
    opacity?: number;
    wms?: {
        layers: string;
        format?: string;
        transparent?: boolean;
        version?: string;
    };
    props: {
        url: string;
        attribution: string;
    }
}

export const baseMaps: BaseMap[] = [
    /*
     {
        key: 'terrain-no-labels',
        name: 'Terrengkart',
        props: {
            url: `https://api.maptiler.com/tiles/hybrid/{z}/{x}/{y}.jpg?key=BJ80wMAUZQPIzaslOspR${process.env.MAPTILER_KEY}`,
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        }
    },
    {
        key: 'satellite',
        name: 'Satellittbilete',
        markers: 'light',
        props: {
            url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${process.env.MAPTILER_KEY}`,
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        }

    },
    */
    {
        key: 'topo',
        name: 'Noregskart',
        coverage: 'regional',
        opacity: 0.8,
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }
    },
    {
        key: 'topograatone',
        name: 'Noregskart, gråtone',
        coverage: 'regional',
        opacity: 0.8,
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }

    },
    {
        key: 'toporaster',
        name: 'Noregskart, store bokstaver',
        coverage: 'regional',
        opacity: 0.8,
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'historiske_kart_amt1',
        name: 'Historiske kart (amtskart)',
        coverage: 'regional',
        opacity: 0.75,
        wms: {
            layers: 'amt1',
            format: 'image/png',
            transparent: true,
            version: '1.3.0'
        },
        props: {
            url: 'https://wms.geonorge.no/skwms1/wms.historiskekart?',
            attribution: '&copy; <a class="override-external-icon" href="https://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'world_map',
        name: 'Verdskart',
        bright: true,
        coverage: 'global',
        props: {
            url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a class="override-external-icon" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br/> &copy; <a class="override-external-icon" href="https://carto.com/attributions">CARTO</a>'
        }

    }
];


export const baseMapNames = baseMaps.map(baseMap => baseMap.name);
export const baseMapKeys = baseMaps.map(baseMap => baseMap.key);
export const baseLayerMaps = baseMaps.filter(baseMap => baseMap.coverage === 'global');
export const baseLayerKeys = baseLayerMaps.map(baseMap => baseMap.key);
export const overlayLayerMaps = baseMaps.filter(baseMap => baseMap.coverage === 'regional');
export const overlayLayerKeys = overlayLayerMaps.map(baseMap => baseMap.key);


export const baseMapLookup = baseMaps.reduce<Record<string, BaseMap>>((acc, baseMap) => {
    acc[baseMap.key] = baseMap;
    return acc;
}, {});

