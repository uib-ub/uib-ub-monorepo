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
    cadastreTable?: boolean; // Show in cadastre table


  }
 
const [table, omitLabel, searchable, facet, result, cadastreTable] = Array(6).fill(true);

const sosi = {label: "Lokalitetstype", description: "SOSI-standarden", facet, table, result}
const cadastre = {"within": {label: "Gard", result},
                  "cadastre__gnr": {label: "Gardsnummer", result, sort: "asc" as const, type: "integer" as const}, 
                  "cadastre__bnr": {label: "Bruksnummer", result, sort: "asc" as const, type: "integer" as const}
                }
const uuid = {label: "UUID", result}
const label = {label: "Namn", result}
const location = {label: "Koordinater", result}
const adm = {label: "Område"}
const adm1 = {label: "Fylke", result} // Necessary for it to be included in fields
const adm2 = {label: "Kommune", result} // Necessary for it to be included in fields
const snid = {label: "Stadnamn ID", facet}
const link = {label: "Lenke", result}
const image = {"image.manifest": {label: "Seddel", result}}
const html = {"content.html": {label: "Fulltekst", searchable}}
const text = {"content.text": {label: "Fulltekst", searchable}}



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
      "rawData.komm": {label: "Fulltekst", searchable},
      "rawData.stnavn.loktype.type": {label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table, facet},
      "tmp.knr": {label: "Kommunenummer", facet, result},
      "rawData.stnavn.sted.gårdsnr": {label: "Gardsnummer", facet, result, additionalParams: ["tmp.knr"]},
      "rawData.stnavn.sted.bruksnr": {label: "Bruksnummer", facet, result, additionalParams: ["tmp.knr", "rawData.stnavn.sted.gårdsnr"]},
      "rawData.stnavn.oppslag.oppslord": {label: "Oppslagsord", facet},
      "rawData.stnavn.oppslag.utmledd": {label: "Utmerkingsledd", facet},
      "rawData.stnavn.oppslag.hovledd": {label: "Hovudledd", facet},
      ...cadastre
    },

    hord: {
      uuid, label, location, adm, adm1, adm2, link, ...image,
      "adm3": {label: "Tidligere kommune", result},
      "rawData.merknader": {label: "Fulltekst", searchable},
      "archive.institution": {label: "Arkivtilvising", table, facet},
      "rawData.oppskrivar": {label: "Oppskrivar", table, facet},
      "rawData.oppskrivingsTid": {label: "Oppskrivingstid", table, facet},
      "rawData.bildeNr": {label: "Bildenummer", table, facet},
      ...cadastre
    },
    rygh: {
      uuid, label, location, adm, adm1, adm2, ...html,
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.Bind": {label: "Bind", table, facet},
      "rawData.Side": {label: "Sidetall", table, facet, additionalParams: ["rawData.Bind"]},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.Gnr": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.Bnr": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.Gnr"]},

    },
    leks: {
      uuid, label, location, adm, adm1, adm2,...html,
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.GNIDu": {label: "GNIDu", facet},
      "rawData.Sisteledd": {label: "Sisteledd", facet},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.GNR": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.GNR"]},
    },
    leks_g: {
      uuid, label, ...text,
      "rawData.språk": {label: "Språk", facet},
      "rawData.kjelde": {label: "Kjelde", facet},
    },
    mu1950: {
      uuid, label, location, adm, adm1, adm2, sosi,
      ...cadastre,
      "rawData.KNR": {label: "Knr", table, facet, result},
      "rawData.GNR": {label: "Gnr", table, facet, result, additionalParams: ["rawData.KNR"]},
      "rawData.BNR": {label: "Bnr", table, facet, result, additionalParams: ["rawData.KNR", "rawData.GNR"]},
      "rawData.Eigar": {label: "Eigar", table, facet, cadastreTable},
      "rawData.Mark": {label: "Skyldmark", table, facet, cadastreTable},
      "rawData.Øre": {label: "Skyldøre", table, facet, cadastreTable},
      "gnidu": {label: "GNIDu", facet},
      "rawData.Koordinattype": {label: "Koordinattype", facet},
    },
    m1838: {
      uuid, label, location, sosi, adm,
      "within": {label: "Gard"},
      "rawData.MNR": {label: "Matrikkelnummer", result, table, facet},
      "rawData.LNR": {label: "Løpenummer", result, table, facet},
      "rawData.1723_MNR": {label: "Matrikkelnummer 1723", table, facet},
      "gnidu": {label: "GNIDu", facet},
      "adm1": {label: "Amt", result},
      "adm2": {label: "Prestegjeld", result},
      
    },
    m1886: {
      uuid, label, location, sosi, adm, adm1, adm2,
      "rawData.knr": {label: "Kommunenummer", table, facet, result},
      "rawData.gnr": {label: "Gardsnummer", table, facet, result, additionalParams: ["rawData.knr"]},
      "rawData.bnr": {label: "Bruksnummer", table, facet, result, additionalParams: ["rawData.knr", "rawData.gnr"]},
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
      uuid, label, location, adm, adm1, adm2, sosi, ...html,
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
    .map(([key]) => key.replace("__", "."));
  
  acc[dataset] = resultFields;
  return acc;
}, {} as Record<string, string[]>);


// TODO: make it hard coded and more customizable, and non-boolean
export const searchableFields = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  acc[dataset] = Object.entries(fields)
    .filter(([_, config]) => config.searchable)
    .map(([key, { label }]) => ({
      key,
      label
    }));
  return acc;
}, {} as Record<string, { key: string, label: string }[]>);