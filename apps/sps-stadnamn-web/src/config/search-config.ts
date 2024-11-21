  export interface FieldConfigItem {
    key?: string;
    label: string;
    result?: boolean; // Show in result list
    description?: string; // Description of field
    searchable?: boolean; // Can be selected as search field
    facet?: boolean;
    omitLabel?: boolean;
    table?: boolean; // Show in table view by default
    sort?: 'asc' | 'desc';
    type?: 'integer' | 'keyword';
    additionalParams?: string[];
    docLink?: string; // Link to another document


  }
 
const [table, omitLabel, searchable, facet, result] = Array(5).fill(true);

const sosi = {label: "Lokalitetstype", description: "SOSI-standarden", facet, table}
const cadastre = {"cadastre__gnr": {label: "Gardsnummer", sort: "asc" as const, type: "integer" as const}, "cadastre__bnr": {label: "Bruksnummer", sort: "asc" as const, type: "integer" as const}}
const uuid = {label: "UUID", result}
const label = {label: "Namn", result}
const location = {label: "Koordinater", result}
const adm = {label: "Administrativ enhet"}
const adm1 = {label: "Fylke", result}
const adm2 = {label: "Kommune", result}
const snid = {label: "Stadnamn ID", facet}
const link = {label: "Lenke", result}
const image = {"image.manifest": {label: "Seddel", result}}



export const fieldConfig: Record<string, Record<string, FieldConfigItem>> = {
    search: {
      uuid, label, location, adm, adm1, adm2, link, ...image,
      //"description": {label: "Beskriving"}, // Removed untid short descriptions have been generated
      "datasets": {label: "Datasett", facet, omitLabel, result},
      "children": {label: "Underelement", result},
      snid,
      "gnidu": {label: "GNIDu", facet},
      "midu": {label: "MIDu", facet},
      sosi,
      "rawData.adm1Fallback": {label: "Fylke", facet},
      "rawData.adm2Fallback": {label: "Kommune", facet},
    },
    sof: {
      uuid, label, location, adm, adm1, adm2,
      "placeType.label": {label: "Lokalitetstype", facet, result},
    },
    bsn: {
      uuid, label, location, adm, adm1, adm2,
      "rawData.komm": {label: "Kommentarer", searchable},
      "rawData.stnavn.loktype.type": {label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table, facet},
      "tmp.knr": {label: "Kommunenummer", facet, result},
      "rawData.stnavn.sted.gårdsnr": {label: "Gardsnummer", facet, result},
      "rawData.stnavn.sted.bruksnr": {label: "Bruksnummer", facet, result},
      "rawData.stnavn.oppslag.oppslord": {label: "Oppslagsord", facet},
      "rawData.stnavn.oppslag.utmledd": {label: "Utmerkingsledd", facet},
      "rawData.stnavn.oppslag.hovledd": {label: "Hovudledd", facet},
      ...cadastre
    },

    hord: {
      uuid, label, location, adm, adm1, adm2, link, ...image,
      "rawData.merknader": {label: "Merknader", searchable},
      "archive.institution": {label: "Arkivtilvising", table, facet},
      "rawData.oppskrivar": {label: "Oppskrivar", table, facet},
      "rawData.oppskrivingsTid": {label: "Oppskrivingstid", table, facet},
      "rawData.bildeNr": {label: "Bildenummer", table, facet},
      ...cadastre
    },
    rygh: {
      uuid, label, location, adm, adm1, adm2,
      "content.html": {label: "Fulltekst", searchable},
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.Bind": {label: "Bind", table, facet},
      "rawData.Side": {label: "Sidetall", table, facet, additionalParams: ["rawData.Bind"]},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.Gnr": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.Bnr": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.Gnr"]},

    },
    leks: {
      uuid, label, location, adm, adm1, adm2,
      "content.html": {label: "Fulltekst", searchable},
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.GNIDu": {label: "GNIDu", facet},
      "rawData.Sisteledd": {label: "Sisteledd", facet},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.GNR": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.GNR"]},
    },
    leks_g: {
      uuid, label,
      "content.text": {label: "Fulltekst", searchable},
      "rawData.språk": {label: "Språk", facet},
      "rawData.kjelde": {label: "Kjelde", facet},
    },
    mu1950: {
      uuid, label, location, adm, adm1, adm2,
      "sosi": {label: "Lokalitetstype", facet},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.GNR": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.GNR"]},
      "rawData.Eigar": {label: "Eigar", table, facet},
      "rawData.Mark": {label: "Skyldmark", table, facet},
      "rawData.Øre": {label: "Skyldøre", table, facet},
      "gnidu": {label: "GNIDu", facet},
      "rawData.Koordinattype": {label: "Koordinattype", facet},
    },
    m1838: {
      uuid, label, location, sosi, adm,
      "rawData.MNR": {label: "Matrikkelnummer", result, table, facet},
      "rawData.LNR": {label: "Løpenummer", result, table, facet},
      "rawData.1723_MNR": {label: "Matrikkelnummer 1723", table, facet},
      "gnidu": {label: "GNIDu", facet},
      "adm1": {label: "Amt", result},
      "adm2": {label: "Prestegjeld", result},
      
    },
    m1886: {
      uuid, label, location, sosi, adm, adm1, adm2,
      "rawData.knr": {label: "Kommunenummer", table, facet},
      ...cadastre,
      "gnidu": {label: "GNIDu", facet},
      "midu": {label: "MIDu", facet}
    },
    skul: {
      uuid, label, location, adm, adm1, adm2,
      "rawData.gnr": {label: "Gardsnummer", table, facet},
      "rawData.bnr": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.gnr"]},
      "rawData.knr": {label: "knr", table, facet},
    },
    nbas: {
      uuid, label, location, adm, adm1, adm2, sosi,
      "content.html": {label: "Fulltekst", searchable},
      "rawData.lokalitetstype_sosi": {label: "Lokalitetstype", facet},
      "rawData.herred": {label: "Kommune", facet},
      "rawData.fylke": {label: "Fylke", facet},
      "rawData.kommunenummer": {label: "Kommunenummer", facet},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.Språk": {label: "Språk", facet},
      "gnidu": {label: "GNIDu", facet},
      "midu": {label: "MIDu", facet}
    },
    ostf: {
      uuid, label, adm, adm1, adm2,
      "rawData.Bindsortering": {label: "Bind", facet},
      "rawData.GNID": {label: "GNID", facet, result},
    },
    tot: {
      uuid, label, adm, adm1, adm2,
      "rawData.GNR": {label: "Gardsnummer", table, facet},
      "rawData.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.GNR"]},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.Kjeldeform": {label: "Kjeldeform", facet},
    },
    ssr2016: {
      uuid, label, adm, adm1, adm2,
      "rawData.Stedsnavn_lokalId": {label: "SSR-nummer", facet},
      "rawData.ENH_SSR_ID": {label: "Gammelt SSR-nummer", facet},
      "misc.language": {label: "Språk", facet},
      "misc.status": {label: "Status 2016", facet},
    },
  }


  

export const facetConfig: Record<string, FieldConfigItem[]> = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  acc[dataset] = Object.entries(fields)
    .filter(([_, config]) => config.facet)
    .map(([key, config]) => ({
      key,
      ...config
    }));
  return acc;
}, {} as Record<string, FieldConfigItem[]>);


// Fields needed for the result list
export const resultConfig = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  // Get all fields (dataset-specific + global) that have result: true
  const resultFields = Object.entries(fields)
    .filter(([_, config]) => config.result)
    .map(([key]) => key);
  
  acc[dataset] = resultFields;
  return acc;
}, {} as Record<string, string[]>);


export const searchableFields = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  acc[dataset] = Object.entries(fields)
    .filter(([_, config]) => config.searchable)
    .map(([key, { label }]) => ({
      key,
      label
    }));
  return acc;
}, {} as Record<string, { key: string, label: string }[]>);


  
  export const oldFacetConfig = {
      search: [
        {key: "datasets", label: "Datasett", omitLabel: true},
        //{key: "coordinateDataset", label: "DEBUG COORD"},
       // {key: "adm1Fallback", label: "Fylke (ustandardisert)"},
        //{key: "adm2Fallback", label: "Kommune (ustandardisert)"},
        {key: "snid", label: "Stadnamn ID"},
        {key: "gnidu", label: "GNIDu"},
        {key: "midu", label: "MIDu"},
        sosi

      ],
      bsn: [
        {key: "rawData.stnavn.loktype.type", label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table},
        {key: "tmp.knr", label: "Kommunenummer"},
        {key: "rawData.stnavn.sted.gårdsnr", label: "Gardsnr"},
        {key: "rawData.stnavn.sted.bruksnr", label: "Bruksnr"},
        {key: "rawData.stnavn.oppslag.oppslord", label: "Oppslagsord"},
        {key: "rawData.stnavn.oppslag.utmledd", label: "Utmerkingsledd"},
        {key: "rawData.stnavn.oppslag.hovledd", label: "Hovudledd"},
      ],
      hord: [
        {key: "archive.institution", label: "Arkivtilvising", table},
        {key: "cadastre__gnr", label: "Gardsnummer", sort: "asc", type: "integer"},
        {key: "cadastre__bnr", label: "Bruksnummer", sort: "asc", type: "integer"},
        {key: "rawData.oppskrivar", label: "Oppskrivar", table},
        {key: "rawData.oppskrivingsTid", label: "Oppskrivingstid", table},
        {key: "rawData.bildeNr", label: "Bildenummer", table},

      ],
      rygh: [
        {key: "rawData.Lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.Bind", label: "Bind", type: "integer"},
        {key: "rawData.Side", label: "Sidetall", additionalParams: ["rawData.Bind"]},
        {key: "rawData.KNR", label: "Kommunenummer"},
        {key: "rawData.Gnr", label: "Gardsnummer (rådata)", additionalParams: ["rawData.KNR"]},
        {key: "rawData.Bnr", label: "Bruksnummer (rådata)", additionalParams: ["rawData.KNR", "rawData.Gnr"]},
      ],
      leks: [
        {key: "rawData.Lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.GNIDu", label: "GNIDu"},
        {key: "rawData.Sisteledd", label: "Sisteledd"},
        {key: "rawData.Kjelde", label: "Kjelde"},
      ],
      leks_g: [
        {key: "rawData.språk", label: "Språk"},
        {key: "rawData.kjelde", label: "Kjelde"},
        
      ],
      mu1950: [
        {key: "sosi", label: "Lokalitetstype"},
        {key: "rawData.KNR", label: "Kommunenummer"},
        {key: "rawData.GNR", label: "Gardsnummer"},
        {key: "rawData.BNR", label: "Bruksnummer"},        
        {key: "rawData.Eigar", label: "Eigar", table},
        {key: "rawData.Mark", label: "Skyldmark", table},
        {key: "rawData.Øre", label: "Skyldøre", table},
        {key: "gnidu", label: "GNIDu"},
        {key: "rawData.Koordinattype", label: "Koordinattype"},
      ],
      m1838: [
        sosi,
        {key: "rawData.MNR", label: "Matrikkelnummer"},
        {key: "rawData.LNR", label: "Løpenummer"},
        {key: "rawData.1723_MNR", label: "Matrikkelnummer 1723"},
        {key: "rawData.GNIDu", label: "GNIDu"},
        {key: "adm2", label: "Prestegjeld"},
        {key: "adm1", label: "Amt"},
      ],
      m1886: [
        sosi,
        {key: "rawData.knr", label: "Kommunenummer"},
        {key: "cadastre__gnr", label: "Gardsnummer"},
        {key: "cadastre__bnr", label: "Bruksnummer"},
        {key: "gnidu", label: "GNIDu"},
      ],
      skul: [
        {key: "rawData.gnr", label: "Gardsnummer", sort: "asc"},
        {key: "rawData.bnr", label: "Bruksnummer", sort: "asc"},
        {key: "rawData.knr", label: "knr"},
      ],
      nbas: [
        {key: "rawData.lokalitetstype_sosiype", label: "Lokalitetstype"},
      ],
      ostf: [
        {key: "rawData.Bindsortering", label: "Bind"},
      ],
      tot: [
        {key: "rawData.GNR", label: "Gardsnummer"},
        {key: "rawData.BNR", label: "Bruksnummer"},
        {key: "rawData.Kjelde", label: "Kjelde"},
        {key: "rawData.Kjeldeform", label: "Kjeldeform"},
      ],
      ssr2016: [
        {key: "rawData.Stedsnavn_lokalId", label: "SSR-nummer"},
        {key: "rawData.ENH_SSR_ID", label: "Gammelt SSR-nummer"},
        {key: "misc.language", label: "Språk"},
        {key: "misc.status", label: "Status 2016"},
      ],
  
  }