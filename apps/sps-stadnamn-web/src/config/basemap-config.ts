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

interface BaseMap {
    key: string;
    name: string;
    bright?: boolean;
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
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }
    },
    {
        key: 'topograatone',
        name: 'Noregskart, gråtone',
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }

    },
    {
        key: 'toporaster',
        name: 'Noregskart, store bokstaver',
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'world_map',
        name: 'Verdskart',
        bright: true,
        props: {
            url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a class="override-external-icon" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br/> &copy; <a class="override-external-icon" href="https://carto.com/attributions">CARTO</a>'
        }

    }
];


export const baseMapNames = baseMaps.map(baseMap => baseMap.name);
export const baseMapKeys = baseMaps.map(baseMap => baseMap.key);


export const baseMapLookup = baseMaps.reduce<Record<string, BaseMap>>((acc, baseMap) => {
    acc[baseMap.key] = baseMap;
    return acc;
}, {});

