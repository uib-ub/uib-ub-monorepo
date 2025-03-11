export interface FieldConfigItem {
  label?: string;
  result?: boolean; // Show in result list
  description?: string; // Description of field
  fulltext?: boolean; // Can be selected as search field
  facet?: boolean;
  omitLabel?: boolean;
  table?: boolean; // Show in table view by default
  sort?: 'asc' | 'desc';
  type?: 'integer' | 'keyword';
  additionalParams?: string[];
  docLink?: string; // Link to another document
  cadastreTable?: boolean; // Show in cadastre table
  featuredFacet?: boolean; // Show in custom facet
  child?: string; // Child facet. The parent facet is handled client side, the child is handled server side
}

interface FacetConfigItem extends FieldConfigItem {
  key: string; 
}
 
const [table, omitLabel, fulltext, facet, result, cadastreTable, featuredFacet, superFacet] = Array(8).fill(true);

const sosi = {label: "Lokalitetstype", description: "SOSI-standarden", facet, table, result}
const cadastre = {"within": {label: "Gard", result},
                  "cadastre__gnr": {label: "Gardsnummer", result, sort: "asc" as const, type: "integer" as const}, 
                  "cadastre__bnr": {label: "Bruksnummer", result, sort: "asc" as const, type: "integer" as const}
                }
const uuid = {label: "UUID", result}
const label = {label: "Namn", result}
const adm = {label: "Område"}
const adm1 = {label: "Fylke", result} // Necessary for it to be included in fields
const adm2 = {label: "Kommune", result} // Necessary for it to be included in fields
const snid = {label: "Stadnamn ID", facet}
const gnidu = {label: "GNIDu", facet}
const midu = {label: "MIDu", facet}
const identifiers = {snid, gnidu, midu}
const link = {label: "Lenke", result}
const image = {"image.manifest": {label: "Seddel", result}}
const html = {"content.html": {label: "Tekstinnhald", fulltext}}
const text = {"content.text": {label: "Tekstinnhald", fulltext}}
const labelDefaults = {
  "altLabels": {label: "Andre namn", table, facet, result},
  "attestations": {label: "Kjeldeformer", table, result},
}

export const fieldConfig: Record<string, Record<string, FieldConfigItem>> = {
    search: {
      uuid, label, adm, adm1, adm2, link, ...image, 
      "datasets": {label: "Kjelder", facet, omitLabel, result, featuredFacet},
      "datasetTag": {label: "Datasettstype", facet, omitLabel, child: "datasets"},
      ...labelDefaults,
      "adm3": {label: "Sogn, bydel eller tidlegare kommune", result},
      //"description": {label: "Beskriving"}, // Removed untid short descriptions have been generated
      
      "children": {label: "Underelement", result},
      snid,
      "gnidu": {label: "GNIDu", facet},
      //"midu": {label: "MIDu", facet}, Not present
      sosi
    },
    bsn: {
      uuid, label, adm, adm1, adm2,
      "rawData.komm": {label: "Kommentarer", fulltext},
      "rawData.stnavn.loktype.type": {label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table, facet},
      "tmp.knr": {label: "Kommunenummer", facet, result},
      "rawData.stnavn.sted.gårdsnr": {label: "Gardsnummer", facet, result, additionalParams: ["tmp.knr"]},
      "rawData.stnavn.sted.bruksnr": {label: "Bruksnummer", facet, result, additionalParams: ["tmp.knr", "rawData.stnavn.sted.gårdsnr"]},
      "rawData.stnavn.oppslag.oppslord": {label: "Oppslagsord", facet},
      "rawData.stnavn.parform.pf_navn": {label: "Parform", facet},
      "rawData.stnavn.gmlsform.navnform": {label: "Gammel navnform", facet},
      ...cadastre,
      ...identifiers,
    },

    hord: {
      uuid, label, adm, adm1, adm2, link, ...image,
      "archive.institution": {label: "Arkivtilvising", table, facet, featuredFacet},
      "adm3": {label: "Tidligere kommune", result},
      "rawData.merknader": {label: "Merknader", fulltext},
      "rawData.kommuneNr": {label: "Kommunenummer", table, facet},
      "rawData.oppskrivar": {label: "Oppskrivar", table, facet},
      "rawData.oppskrivingsTid": {label: "Oppskrivingstid", table, facet},
      "rawData.bildeNr": {label: "Bildenummer", table, facet},
      ...cadastre,
      ...identifiers,
    },
    rygh: {
      uuid, label, adm, adm1, adm2, ...html,
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.Bind": {label: "Bind", table, facet},
      "rawData.Side": {label: "Sidetall", table, facet, additionalParams: ["rawData.Bind"]},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.Gnr": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.Bnr": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.Gnr"]},
      ...identifiers,

    },
    leks: {
      uuid, label, adm, adm1, adm2,...html,
      "misc.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "misc.Sisteledd": {label: "Sisteledd", facet},
      "misc.Kjelde": {label: "Kjelde", facet},
      "misc.KNR": {label: "Kommunenummer", table, facet},
      "misc.GNR": {label: "Gardsnummer", table, facet, additionalParams: ["misc.KNR"]},
      "misc.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["misc.KNR", "misc.GNR"]},
      ...identifiers,
    },
    leks_g: {
      uuid, label, ...text,
      "rawData.språk": {label: "Språk", facet},
      "rawData.kjelde": {label: "Kjelde", facet},
    },
    mu1950: {
      uuid, label, adm, adm1, adm2, sosi, 
      ...cadastre,
      "within": {label: "Gard", result},
      "knr": {label: "Knr", table, facet, result},
      "misc.GNR": {label: "Gnr", table, facet, result, additionalParams: ["knr"]},
      "misc.BNR": {label: "Bnr", table, facet, result, additionalParams: ["knr", "misc.GNR"]},
      "misc.Eigar": {label: "Eigar", table, facet, cadastreTable},
      "misc.Mark": {label: "Skyldmark", table, facet, cadastreTable},
      "misc.Øre": {label: "Skyldøre", table, facet, cadastreTable},
      "misc.Koordinattype": {label: "Koordinattype", facet},
      ...identifiers,
    },  
    m1838: {
      uuid, label, sosi, adm,
      "within": {label: "Gard"},
      "misc.MNR": {label: "Matrikkelnummer", result, table, facet},
      "knr": {label: "Kommunenummer", facet, result},

      "misc.LNR": {label: "Løpenummer", result, table, facet},
      "miac.1723_MNR": {label: "Matrikkelnummer 1723", table, facet},
      "adm1": {label: "Amt", result},
      "adm2": {label: "Prestegjeld", result},
      ...identifiers,
      
    },
    m1886: {
      uuid, label, sosi, adm, adm1, adm2,
      "misc.knr": {label: "Kommunenummer", table, facet, result},
      "misc.gnr": {label: "Gardsnummer", table, facet, result, additionalParams: ["misc.knr"]},
      "misc.bnr": {label: "Bruksnummer", table, facet, result, additionalParams: ["misc.knr", "misc.gnr"]},
      ...cadastre,
      ...identifiers,
    },
    skul: {
      uuid, label, adm, adm1, adm2,
      "rawData.gnr": {label: "Gardsnummer", table, result, facet},
      "rawData.bnr": {label: "Bruksnummer", table, result, facet, additionalParams: ["rawData.gnr"]},
      "rawData.knr": {label: "knr", table, result, facet},
      ...identifiers,
    },
    nbas: {
      uuid, label, adm, adm1, adm2, sosi, ...html,
      "rawData.herred": {label: "Kommune", facet},
      "rawData.fylke": {label: "Fylke", facet},
      "rawData.kommunenummer": {label: "Kommunenummer", facet},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.Språk": {label: "Språk", facet},
      snid,
      gnidu
      
    },
    ostf: {
      uuid, label, adm, adm1, adm2,
      "rawData.Bindsortering": {label: "Bind", facet},
      "rawData.GNID": {label: "GNID", facet, result},
      ...identifiers,
    },
    tot: {
      uuid, label, adm, adm1, adm2,
      "rawData.GNR": {label: "Gardsnummer", table, facet},
      "rawData.BNR": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.GNR"]},
      "rawData.Kjelde": {label: "Kjelde", facet},
      "rawData.Kjeldeform": {label: "Kjeldeform", facet},
      ...identifiers,
    },
    sof: {
      uuid, label, adm, adm1, adm2,
      "placeType.label": {label: "Lokalitetstype", facet, result},
      ...identifiers,
    },
    ssr2016: {
      uuid, label, adm, adm1, adm2,
      "rawData.Stedsnavn_lokalId": {label: "SSR-nummer", facet},
      "rawData.ENH_SSR_ID": {label: "Gammelt SSR-nummer", facet},
      "misc.language": {label: "Språk", facet},
      "misc.status": {label: "Status 2016", facet},
      ...identifiers,
    },
    ssr2020: {
      uuid, label, adm, adm1, adm2,
      "misc.Stedsnummer": {label: "Stedsnummer", facet, result}, 
      "misc.Språk": {label: "Språk", facet},
      "misc.Status_skrivemåte": {label: "Status", facet},
      "misc.KNR": {label: "Kommunenummer", facet},
      "misc.Navneobjekthovedgruppe": {label: "Hovedgruppe", facet},
      "misc.Navneobjektgruppe": {label: "Gruppe", facet},
      "misc.Kjelde": {label: "Kjelde", facet},
      "misc.År": {label: "År", facet},
      "misc.Lenke": {label: "Lenke", result},
      sosi,
      ...identifiers,
    },
    nrk: {
      uuid, label, adm, adm1, adm2,
      "rawData.Kategori": { label: "Kategori", result, table, facet },
      "rawData.IndeksNamn": { label: "Indeksnamn", result, table, facet },
      "rawData.Namn": { label: "Namn", result, table },
      "rawData.KorrektNamn": { label: "Korrekt namn", result, table },
      "rawData.Uttale1": { label: "Uttale 1", table },
      "rawData.Uttale2": { label: "Uttale 2", table },
      "rawData.Uttalemerknad": { label: "Uttalemerknad", result, table, facet },
      "rawData.Transkripsjonskvalitet": { label: "Transkripsjonskvalitet", result, table, facet },
      "rawData.UttaleNy": { label: "Ny uttale", result, table, facet },
      "rawData.UttalemerknadNy": { label: "Ny uttalemerknad", result, table },
      "rawData.Kategorikode": { label: "Kategorikode", result, table, facet },
      "rawData.SSRobjektID": { label: "SSR objekt ID", table },
      "rawData.Kommunenummer": { label: "Kommunenummer", table, facet },
      "rawData.SistEndra": { label: "Sist endra", table }
    }
  }

export const facetConfig: Record<string, FacetConfigItem[]> = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  acc[dataset] = Object.entries(fields)
    .filter(([_, config]) => config.facet)
    .map(([key, config]) => ({
      key,
      ...config
    }));
  return acc;
}, {} as Record<string, FacetConfigItem[]>);

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
export const fulltextFields = Object.entries(fieldConfig).reduce((acc, [dataset, fields]) => {
  acc[dataset] = Object.entries(fields)
    .filter(([_, config]) => config.fulltext && config.label)
    .map(([key, { label }]) => ({
      key,
      label: label!
    }));
  return acc;
}, {} as Record<string, { key: string, label: string }[]>);