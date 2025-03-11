export interface ContentSettingsItem {
  display: string;
  adm?: number; // Deepest level of adm
  cadastre?: boolean; // If the dataset contains standardized cadastral data
  sort?: any[]; // Custom sort array
  fields?: string[]; // Custom fields to include in the search
}

export interface TreeSettingsItem {
  subunit: string, 
  subunitLabel?: string,
  sort: string[], // Sort cadastral units
  aggSort: string, // Sort aggregated divisions above the cadastral unit (e. g. municipalities)
  filter?: any, 
  showNumber?: boolean,
  leaf: string,
  parentName: string,
  geoSort?: string
}

export const treeSettings: Record<string, TreeSettingsItem> = {
  m1838: {
    subunit: "misc.MNR",
    subunitLabel: "Matrikkelnummer",
    parentName: "misc.gardLabel",
    leaf: "misc.LNR",
    sort: ["cadastralIndex"],
    aggSort: "link.keyword",
    geoSort: "misc.LNR.keyword"
  },
  m1886: {
    subunit: "cadastre__gnr",
    parentName: "misc.gardsnamn",
    leaf: "cadastre__bnr",
    sort: ["cadastre__gnr", "cadastre__bnr"],
    aggSort: "misc.knr.keyword",
    geoSort: "misc.bnr.keyword"
  },
  mu1950: {
    subunit: "cadastre__gnr",
    parentName: "misc.Gardsnamn",
    leaf: "cadastre__bnr",
    sort: ["cadastre__gnr", "cadastre__bnr"],
    aggSort: "knr.keyword",
    showNumber: true,
    geoSort: "misc.BNR.keyword"
  },
  /*
  rygh: {
    subunit: "rawData.Gnr",
    parentName: "label",
    leaf: "rawData.Bnr",
    sort: ["rawData.Gnr", "rawData.Bnr"],
    aggSort: "rawData.KNR.keyword",
    showNumber: true
  }
    */
}


  export const contentSettings: Record<string, ContentSettingsItem> = {
    search: {
      display: 'map',
      adm: 3,
      sort: ["_score", "ranking", "adm1.keyword", "adm2.keyword"] //  "ranking" added in order to favor results with snid and multiple attestations
    },
    bsn: {
      display: 'map',
      adm: 2,
      cadastre: true
    },
    hord: {
      display: 'map',
      adm: 3,
      cadastre: true
    },
    leks: {
      display: 'map',
      adm: 2,
    },
    leks_g: {
      display: 'table',
    },
    m1838: {
      display: 'map',
      adm: 2,
      cadastre: false, // Old cadastral system and messy data
      sort: ["_score", "cadastralIndex"],
    },
    m1886: {
      display: 'map',
      adm: 2,
      cadastre: true,
    },
    mu1950: {
      display: 'map',
      adm: 2,
      cadastre: true,
    },
    nbas: {
      display: 'map',
      adm: 2,
      cadastre: false // not cleaned yet
    },
    ostf: {
      display: 'map',
      adm: 2,
      cadastre: false
    },
    skul: {
      display: 'map',
      adm: 2,
      cadastre: false // not cleaned yet
    },
    sof: {
      display: 'map',
      adm: 2,
      cadastre: false
    },
    rygh: {
      display: 'map',
      adm: 2,
      cadastre: true
    },
    tot: {
      display: 'map',
      adm: 3,
      cadastre: true
    },
    ssr2016: {
      display: 'map',
      adm: 2,
      cadastre: false // not cleaned yet
    },
    ssr2020: {
      display: 'map',
      adm: 2,
      cadastre: false // not cleaned yet
    },
    nrk: {
      display: 'map',
      adm: 2,
      cadastre: false
    }
  }


export const getSortArray = (dataset: string): (string | object)[] => {
  const datasetSettings = contentSettings[dataset];

  const sortArray: any[] = ["_score"]

  if (!datasetSettings) {
    return sortArray
  }

  // If overridden
  if (datasetSettings.sort?.length) {
    return datasetSettings.sort
  }

  
  if (datasetSettings.adm) {
    // Sort by all adm levels according to the dataset
    for (let i = 1; i <= datasetSettings.adm; i++) {
      sortArray.push(`adm${i}.keyword`)
    }
  }

  if (datasetSettings.cadastre) {
    sortArray.push({
      "cadastre.gnr": {
        "order": "asc", // or "desc" depending on your requirement
        "mode": "min", // or "max", depending on how you want to sort multiple values within nested objects
        "missing": "_last", // or "_last", depending on how you want to handle missing values
        "nested": {
          "path": "cadastre" // Specify the path to the nested field
        }}})
      sortArray.push({
      "cadastre.bnr": { 
        "order": "asc", // or "desc", depending on your requirement
        "mode": "min", // or "max", depending on how you want to sort multiple values within nested objects
        "missing": "_first", // or "_last", depending on how you want to handle missing values
        "nested": {
          "path": "cadastre" // Specify the path to the nested field
        }}})
    }

    return sortArray
  }



  

