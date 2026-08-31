const cartoTileUrl = (style: string) =>
    `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${process.env.CARTO_TOKEN}`

// Default bakgrunnskart bør heller endres hvis man søker i et datasett med annen geografisk dekning enn Norge. 
export const backgroundMap = {
    url: cartoTileUrl('light_nolabels'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}

export const defaultBaseMap = 'standard'

const centerPoints: Record<string, [number, number]> = {
    "Norway": [63.43, 10.40],
    "Svalbard": [78.22, 15.63],
}

export type MapLayerCoverage = 'global' | 'regional'

export interface BaseMap {
    key: string;
    name: string;
    provider?: string;
    description?: string;
    license?: string;
    bright?: boolean;
    coverage: MapLayerCoverage;
    center?: [number, number];
    info?: string;
    /**
     * Optional geographic bounds for the layer.
     * Format: [[north, west], [south, east]]
     */
    bounds?: [[number, number], [number, number]];
    opacity?: number;
    maxZoom?: number;
    maxNativeZoom?: number;
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
        name: 'Topografisk noregskart',
        description: 'Topografisk grunnkart for Noreg, med data frå N50 til N2000, FKB, matrikkel, høgde- og djupnedata. Fargekartografi tilpassa webbruk.',
        license: 'Åpne data (CC BY 4.0)',
        info: 'https://kartkatalog.geonorge.no/metadata/topografisk-norgeskart-wmts--cache/8f381180-1a47-4453-bee7-9a3d64843efa',
        provider: 'Kartverket',
        coverage: 'regional',
        center: centerPoints.Norway,
        // Approximate bounds for mainland Norway
        bounds: [[71.3, 4.0], [57.9, 31.5]],
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }
    },
    {
        key: 'topograatone',
        name: 'Topografisk gråtonekart',
        description: 'Gråtonevariant av Topografisk noregskart med same datagrunnlag som topo-laget, tilpassa webvising.',
        license: 'Åpne data (CC BY 4.0)',
        info: 'https://kartkatalog.geonorge.no/metadata/topografisk-norgeskart-wmts--cache/8f381180-1a47-4453-bee7-9a3d64843efa',
        provider: 'Kartverket',
        coverage: 'regional',
        center: centerPoints.Norway,
        bounds: [[71.3, 4.0], [57.9, 31.5]],
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>',
        }

    },
    {
        key: 'toporaster',
        name: 'Topografisk noregskart (raster)',
        description: 'Topografisk rasterkart med innhald frå N50 til N2000 og N5.',
        license: 'Åpne data (CC BY 4.0)',
        info: 'https://kartkatalog.geonorge.no/metadata/topografisk-norgeskart-wmts--cache/8f381180-1a47-4453-bee7-9a3d64843efa',
        provider: 'Kartverket',
        coverage: 'regional',
        center: centerPoints.Norway,
        bounds: [[71.3, 4.0], [57.9, 31.5]],
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'sjokartraster',
        name: 'Sjøkart (raster)',
        description: 'Sjøkartraster med sjøkartdata frå overseglingskart, hovudkart, kystkart, hamnekart og Svalbardkart. Ikkje eigna til navigasjon.',
        license: 'Åpne data (CC BY 4.0)',
        info: 'https://kartkatalog.geonorge.no/metadata/sjokartraster-wmts--cache/8f381180-1a47-4453-bee7-9a3d64843efa',
        provider: 'Kartverket',
        coverage: 'regional',
        center: centerPoints.Norway,
        // Approximate bounds based on WMTS WGS84BoundingBox
        bounds: [[81.78, -14.66], [53.75, 44.25]],
        props: {
            url: 'https://cache.kartverket.no/v1/wmts/1.0.0/sjokartraster/default/webmercator/{z}/{y}/{x}.png',
            attribution: '&copy; <a class="override-external-icon" href="http://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'historiske_kart_amt1',
        name: 'Historiske kart (amtskart)',
        description: 'Georefererte historiske amtskart (1:200 000), den første landsdekkande kartserien som vart selt i Noreg. Første blad kom i 1826, og serien vart publisert over om lag 90 år.',
        license: 'Åpne data (CC BY 4.0)',
        info: "https://kartkatalog.geonorge.no/metadata/historiske-kart-wms/f0ef87bf-91a1-4f00-b864-9655d3d7c1de",
        provider: 'Kartverket',
        coverage: 'regional',
        center: centerPoints.Norway,
        bounds: [[71.3, 4.0], [57.9, 31.5]],
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
        key: 'matrikkelkart',
        name: 'Matrikkelen - Eiendomskart Teig',
        description: 'Utdrag frå Matrikkelen med eigedomsteigar, grenser, grensepunkt og teigareal med kvalitetsopplysningar. Eigna for kartvising og geografiske analysar av eigedomsdata. Merk: Kartet visast berre når du er zooma inn.',
        license: 'Åpne data (CC BY 4.0)',
        info: "https://kartkatalog.geonorge.no/metadata/matrikkelen-eiendomskart-teig/74340c24-1c8a-4454-b813-bfe498e80f16",
        provider: 'Kartverket',
        coverage: 'regional',
        bounds: [[71.3, 4.0], [57.9, 31.5]],
        wms: {
            layers: 'matrikkelkart',
            format: 'image/png',
            transparent: true,
            version: '1.3.0'
        },
        props: {
            url: 'https://wms.geonorge.no/skwms1/wms.matrikkelkart?language=eng&',
            attribution: '&copy; <a class="override-external-icon" href="https://www.kartverket.no/">Kartverket</a>'
        }
    },
    {
        key: 'svalbard_basiskart',
        name: 'Basiskart Svalbard',
        provider: 'Norsk Polarinstitutt',
        info: 'https://kartkatalog.geonorge.no/metadata/np-basiskart-svalbard-wmts-3857/485822c4-eb86-42f8-988a-6008a75ffd5f',
        license: 'Åpne data (CC BY 4.0)',
        coverage: 'regional',
        center: centerPoints.Svalbard,
        // Approximate bounds for Svalbard
        bounds: [[81.0, 5.0], [74.0, 35.0]],
        maxZoom: 18,
        maxNativeZoom: 18,
        props: {
            url: 'https://geodata.npolar.no/arcgis/rest/services/Basisdata/NP_Basiskart_Svalbard_WMTS_3857/MapServer/WMTS/tile/1.0.0/Basisdata_NP_Basiskart_Svalbard_WMTS_3857/default/GoogleMapsCompatible/{z}/{y}/{x}',
            attribution: '&copy; <a class="override-external-icon" href="https://www.npolar.no/">Norsk Polarinstitutt</a>'
        }
    },
    {
        key: 'neutral',
        name: 'Nøytral',
        provider: 'CARTO',
        maxZoom: 20,
        maxNativeZoom: 20, 
        bright: true,
        coverage: 'global',
        props: {
            url: cartoTileUrl('light_nolabels'),
            attribution: '&copy; <a class="override-external-icon" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a class="override-external-icon" href="https://carto.com/attributions">CARTO</a>'
        }

    },
    {
        key: 'standard',
        name: 'Standard',
        provider: 'CARTO',
        maxZoom: 20,
        maxNativeZoom: 20,
        coverage: 'global',
        props: {
            url: cartoTileUrl('rastertiles/voyager_nolabels'),
            attribution: '&copy; <a class="override-external-icon" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a class="override-external-icon" href="https://carto.com/attributions">CARTO</a>'
        }
    }, /*
    {
        key: 'high_contrast',
        name: 'Høgkontrast',
        provider: 'Stadia Maps / Stamen',
        coverage: 'global',
        maxZoom: 20,
        maxNativeZoom: 20,
        props: {
            url: 'https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}.png',
            attribution: '&copy; <a class="override-external-icon" href="https://stadiamaps.com/">Stadia Maps</a> <a class="override-external-icon" href="https://stamen.com/">&copy; Stamen Design</a> &copy; <a class="override-external-icon" href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a class="override-external-icon" href="https://www.openstreetmap.org/about">OpenStreetMap</a> contributors'
        }
    },*/
    {
        key: 'terrain',
        name: 'Terreng',
        provider: 'OpenTopoMap',
        coverage: 'global',
        maxZoom: 20,
        maxNativeZoom: 17,
        props: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: 'Map data: &copy; <a class="override-external-icon" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a class="override-external-icon" href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a class="override-external-icon" href="https://opentopomap.org">OpenTopoMap</a> (<a class="override-external-icon" href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }
    },
    {
        key: 'satellite',
        name: 'Foto',
        provider: 'Esri',
        coverage: 'global',
        maxZoom: 20,
        maxNativeZoom: 18,
        props: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

