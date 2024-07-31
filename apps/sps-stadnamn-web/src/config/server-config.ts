export interface ContentSettingsItem {
  display: string;
  adm?: number;
  cadastre?: boolean;
  sort?: any[];
}



  export const contentSettings: Record<string, ContentSettingsItem> = {
    search: {
      display: 'map',
      adm: 2,
      sort: ["_score", "adm1.keyword", "adm2.keyword"] // add "ranking" in order to favor results with snid and multiple attestations
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
      display: 'table',
      adm: 2,
      cadastre: false, // Old cadastral system and messy data
      sort: ["_score", "cadastreSort.mnr", "cadastreSort.mnrLetter", "cadastreSort.lnr", "cadastreSort.lnrLetter"]
    },
    m1886: {
      display: 'map',
      adm: 2,
      cadastre: true
    },
    mu1950: {
      display: 'map',
      adm: 2,
      cadastre: true
    },
    nbas: {
      display: 'map',
      adm: 2,
      cadastre: false // not cleaned yet
    },
    ostf: {
      display: 'map',
      adm: 2,
      cadastre: true
    },
    skul: {
      display: 'map',
      adm: 2,
      cadastre: true
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
  

