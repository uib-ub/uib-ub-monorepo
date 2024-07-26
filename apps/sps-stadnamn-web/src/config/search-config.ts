export interface FacetConfigItem {
    key: string;
    label: string;
    omitLabel?: boolean;
    sort?: 'doc_count' | 'asc' | 'desc';
  }

  export interface FieldConfigItem {
    key: string;
    label: string;
  }

  export interface SortConfigItem {
    display: string;
    noAdm: boolean;
  }

export const fieldConfig: Record<string, FieldConfigItem[]> = {
    search: [
      {"key": "label", "label": "Namn"},
      {"key": "description", "label": "Beskriving"},
    ],
    hord: [
      {"key": "label", "label": "Namn"},
      {"key": "rawData.merknader", "label": "Merknader"},
    ]
  }
  
  
  
  export const facetConfig: Record<string, FacetConfigItem[]> = {
      search: [
        {"key": "datasets", "label": "Datasett", "omitLabel": true},
        {"key": "adm1Fallback", "label": "Fylke (uordna)"},
        {"key": "adm2Fallback", "label": "Kommune (uordna)"},
        {"key": "snid", "label": "Stadnamn ID"},
        {"key": "gnidu", "label": "GNIDu"},
        {"key": "midu", "label": "MIDu"},
        {"key": "sosi", "label": "Lokalitetstype"},

      ],
      rygh: [
        {"key": "rawData.Lokalitetstype", "label": "Lokalitetstype"},
        {"key": "rawData.Gnr", "label": "Gardsnummer"},
        {"key": "rawData.Bnr", "label": "Bruksnummer"},
      ],
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
      m1838: [
        {"key": "rawData.MNR", "label": "Matrikkelnummer"},
        {"key": "rawData.LNR", "label": "Løpenummer"}
      ],
      m1886: [
        {"key": "sosi", "label": "Lokalitetstype"},
        {"key": "cadastre__gnr", "label": "Gardsnummer"},
        {"key": "cadastre__bnr", "label": "Bruksnummer"}
      ],
      skul: [
        {"key": "rawData.gnr", "label": "Gardsnummer", "sort": "asc"},
        {"key": "rawData.bnr", "label": "Bruksnummer", "sort": "asc"},
      ]
  
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

export const miscSettings: Record<string, SortConfigItem> = {
  'leks_g': {
    'display': 'table',
    'noAdm': true
  }
}