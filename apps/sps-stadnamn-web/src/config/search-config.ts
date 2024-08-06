export interface FacetConfigItem {
    key: string;
    label: string;
    omitLabel?: boolean; // Omit label in filter chips
    description?: string; // Description of facet
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
    ],
    rygh: [
      {key: "label", label: "Namn"},
      {key: "content.html", label: "Fulltekst"},
    ],
  }
  

const sosi = {key: "sosi", label: "Lokalitetstype", description: "SOSI-standarden", table: true}
  
  
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
      bsn: [
        {key: "rawData.stnavn.loktype.type", label: "Lokalitetstype", description: "Ustandardisert lokalitetstype", table: true},
        {key: "rawData.stnavn.sted.gårdsnr", label: "Gardsnr"},
        {key: "rawData.stnavn.sted.bruksnr", label: "Bruksnr"},
        {key: "rawData.stnavn.oppslag.oppslord", label: "Oppslagsord"},
        {key: "rawData.stnavn.oppslag.utmledd", label: "Utmerkingsledd"},
        {key: "rawData.stnavn.oppslag.hovledd", label: "Hovudledd"},
      ],
      hord: [
        {key: "archive.institution", label: "Arkivtilvising", table: true},
        {key: "label", label: "debug", table: true},
        {key: "cadastre__gnr", label: "Gardsnummer", sort: "asc", type: "integer"},
        {key: "cadastre__bnr", label: "Bruksnummer", sort: "asc", type: "integer"},
        {key: "rawData.oppskrivar", label: "Oppskrivar", table: true},
        {key: "rawData.oppskrivingsTid", label: "Oppskrivingstid", table: true},
      ],
      rygh: [
        {key: "rawData.Lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.Bind", label: "Bind", type: "integer"},
        {key: "rawData.Sidetall", label: "Sidetall"},
        {key: "cadastre.gnr", label: "Gardsnummer"},
        {key: "cadastre.bnr", label: "Bruksnummer"},
      ],
      leks: [
        {key: "rawData.lokalitetstype", label: "Lokalitetstype"},
        {key: "rawData.gnidu", label: "GNIDu"},
        {key: "rawData.sisteledd", label: "Sisteledd"},
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
        sosi,
        {key: "cadastre__gnr", label: "Gardsnummer"},
        {key: "cadastre__bnr", label: "Bruksnummer"}
      ],
      skul: [
        {key: "rawData.gnr", label: "Gardsnummer", sort: "asc"},
        {key: "rawData.bnr", label: "Bruksnummer", sort: "asc"},
      ]
  
  }