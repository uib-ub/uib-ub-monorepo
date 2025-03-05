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
    sof: {
      uuid, label, adm, adm1, adm2,
      "placeType.label": {label: "Lokalitetstype", facet, result},
    },
    bsn: {
      uuid, label, adm, adm1, adm2,
      "rawData.komm": {label: "Kommentarer", fulltext},
      "rawData.stnavn.loktype.type": {label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table, facet},
      "tmp.knr": {label: "Kommunenummer", facet, result},
      "rawData.stnavn.sted.gårdsnr": {label: "Gardsnummer", facet, result, additionalParams: ["tmp.knr"]},
      "rawData.stnavn.sted.bruksnr": {label: "Bruksnummer", facet, result, additionalParams: ["tmp.knr", "rawData.stnavn.sted.gårdsnr"]},
      "snid": {label: "Stadnamn ID", facet},
      "gnidu": {label: "GNIDu", facet},
      "midu": {label: "MIDu", facet},
      "rawData.stnavn.oppslag.oppslord": {label: "Oppslagsord", facet},
      "rawData.stnavn.parform.pf_navn": {label: "Parform", facet},
      "rawData.stnavn.gmlsform.navnform": {label: "Gammel navnform", facet},
      ...cadastre
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
      ...cadastre
    },
    rygh: {
      uuid, label, adm, adm1, adm2, ...html,
      "rawData.Lokalitetstype": {label: "Lokalitetstype", table, facet},
      "rawData.Bind": {label: "Bind", table, facet},
      "rawData.Side": {label: "Sidetall", table, facet, additionalParams: ["rawData.Bind"]},
      "rawData.KNR": {label: "Kommunenummer", table, facet},
      "rawData.Gnr": {label: "Gardsnummer", table, facet, additionalParams: ["rawData.KNR"]},
      "rawData.Bnr": {label: "Bruksnummer", table, facet, additionalParams: ["rawData.KNR", "rawData.Gnr"]},

    },
    leks: {
      uuid, label, adm, adm1, adm2,...html,
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
      uuid, label, adm, adm1, adm2, sosi, 
      ...cadastre,
      "within": {label: "Gard", result},
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
      uuid, label, sosi, adm,
      "within": {label: "Gard"},
      "rawData.MNR": {label: "Matrikkelnummer", result, table, facet},
      "rawData.LNR": {label: "Løpenummer", result, table, facet},
      "rawData.1723_MNR": {label: "Matrikkelnummer 1723", table, facet},
      "gnidu": {label: "GNIDu", facet},
      "adm1": {label: "Amt", result},
      "adm2": {label: "Prestegjeld", result},
      
    },
    m1886: {
      uuid, label, sosi, adm, adm1, adm2,
      "rawData.knr": {label: "Kommunenummer", table, facet, result},
      "rawData.gnr": {label: "Gardsnummer", table, facet, result, additionalParams: ["rawData.knr"]},
      "rawData.bnr": {label: "Bruksnummer", table, facet, result, additionalParams: ["rawData.knr", "rawData.gnr"]},
      ...cadastre,
      "gnidu": {label: "GNIDu", facet},
      
      "midu": {label: "MIDu", facet}
    },
    skul: {
      uuid, label, adm, adm1, adm2,
      "rawData.gnr": {label: "Gardsnummer", table, result, facet},
      "rawData.bnr": {label: "Bruksnummer", table, result, facet, additionalParams: ["rawData.gnr"]},
      "rawData.knr": {label: "knr", table, result, facet},
    },
    nbas: {
      uuid, label, adm, adm1, adm2, sosi, ...html,
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