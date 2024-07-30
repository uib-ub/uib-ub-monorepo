export interface FacetConfigItem {
    key: string;
    label: string;
    omitLabel?: boolean; // Omit label in filter chips
    table?: boolean; // Show in table view by default
    type?: 'integer' | 'keyword'; // Elasticsearch data type
    sort?: 'doc_count' | 'asc' | 'desc'; // Default sort order in facet
  }

  export interface FieldConfigItem {
    key: string;
    label: string;
  }

 

export const fieldConfig: Record<string, FieldConfigItem[]> = {
    search: [
      {key: "label", label: "Namn"},
      {key: "description", label: "Beskriving"},
    ],
    hord: [
      {key: "label", label: "Namn"},
      {key: "rawData.merknader", label: "Merknader"},
    ]
  }
  

const sosi = {key: "sosi", label: "Lokalitetstype", description: "SOSI-standarden"}
  
  
  export const facetConfig: Record<string, FacetConfigItem[]> = {
      search: [
        {key: "datasets", label: "Datasett", omitLabel: true},
        {key: "adm1Fallback", label: "Fylke (uordna)"},
        {key: "adm2Fallback", label: "Kommune (uordna)"},
        {key: "snid", label: "Stadnamn ID"},
        {key: "gnidu", label: "GNIDu"},
        {key: "midu", label: "MIDu"},
        sosi

      ],
      rygh: [
        {key: "rawData.Lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.Gnr", label: "Gardsnummer"},
        {key: "rawData.Bnr", label: "Bruksnummer"},
      ],
      leks: [
        {key: "rawData.lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.gnidu", label: "GNIDu"},
        {key: "rawData.sisteledd", label: "Sisteledd"},
      ],
      hord: [
        {key: "archive.institution", label: "Arkivtilvising", table: true},
        {key: "cadastre__gnr", label: "Gardsnummer", sort: "asc", type: "integer"},
        {key: "cadastre__bnr", label: "Bruksnummer", sort: "asc", type: "integer"},
        {key: "rawData.oppskrivar", label: "Oppskrivar", table: true},
        {key: "rawData.oppskrivingsTid", label: "Oppskrivingstid", table: true},
      ],
      mu1950: [
        {key: "rawData.eigar", label: "Eigar"},
        {key: "rawData.koordinattype", label: "Koordinattype"}
      ],
      m1838: [
        {key: "rawData.MNR", label: "Matrikkelnummer"},
        {key: "rawData.LNR", label: "Løpenummer"}
      ],
      m1886: [
        {...sosi, table: true},
        {key: "cadastre__gnr", label: "Gardsnummer"},
        {key: "cadastre__bnr", label: "Bruksnummer"}
      ],
      skul: [
        {key: "rawData.gnr", label: "Gardsnummer", sort: "asc"},
        {key: "rawData.bnr", label: "Bruksnummer", sort: "asc"},
      ]
  
  }