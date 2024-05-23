export interface FacetConfigItem {
    key: string;
    label: string;
    sort?: 'doc_count' | 'asc' | 'desc';
  }

  export interface FieldConfigItem {
    key: string;
    label: string;
  }

export const fieldConfig: Record<string, FieldConfigItem[]> = {
    hord: [
      {"key": "label", "label": "Namn"},
      {"key": "rawData.merknader", "label": "Merknader"},
    ]
  }
  
  
  
  export const facetConfig: Record<string, FacetConfigItem[]> = {
      leks: [
        {"key": "rawData.lokalitetstype", "label": "Lokalitetstype"},
        {"key": "rawData.gnidu", "label": "GNIDu"},
        {"key": "rawData.sisteledd", "label": "Sisteledd"},
      ],
      hord: [
        {"key": "archive.institution", "label": "Arkivtilvising"},
        {"key": "cadastre__gnr", "label": "Gardsnummer", "sort": "asc"},
        {"key": "cadastre__bnr", "label": "Bruksnummer", "sort": "asc"},
        {"key": "rawData.oppskrivar", "label": "Oppskrivar"},
        {"key": "rawData.oppskrivingsTid", "label": "Oppskrivingstid"},
      ],
      mu1950: [
        {"key": "rawData.eigar", "label": "Eigar"},
        {"key": "rawData.koordinattype", "label": "Koordinattype"}
      ],
  
  }
  
  
  export const sortConfig: Record<string, Record<string, string>[]> = {
    hord: [
      {"key": "label.keyword", "label": "stadnamn"},
      {"key": "rawData.kommuneNr.keyword,cadastre__gnr,cadastre__bnr", "label": "matrikkel"},
    ],
    ostf: [
      {"key": "label.keyword", "label": "Oppslagsform"},
      {"key": "rawData.GNID.keyword", "label": "Matrikkelnummer"},
    ]
  }