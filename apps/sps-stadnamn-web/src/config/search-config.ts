export interface FacetConfigItem {
    key: string;
    label: string;
    omitLabel?: boolean; // Omit label in filter chips
    description?: string; // Description of facet
    table?: boolean; // Show in table view by default
    type?: 'integer' | 'keyword'; // Elasticsearch data type
    sort?: 'doc_count' | 'asc' | 'desc'; // Default sort order in facet
    additionalParams?: string[]; // Additional filters to apply when facet is clicked
    docLink?: string; // Link to another document
  }

  export interface FieldConfigItem {
    key: string;
    label: string;
  }

 

export const fieldConfig: Record<string, FieldConfigItem[]> = {
    /* search: [ // Removed untid short descriptions have been generated
      {key: "label", label: "Namn"},
      {key: "description", label: "Beskriving"},
    ], */
    hord: [
      {key: "rawData.merknader", label: "Merknader"},
    ],
    rygh: [
      {key: "content.html", label: "Fulltekst"},
    ],
    leks: [
      {key: "content.html", label: "Fulltekst"},
    ],
    leks_g: [
      {key: "content.text", label: "Fulltekst"},
    ],
  }
  
const table = true
const sosi = {key: "sosi", label: "Lokalitetstype", description: "SOSI-standarden", table}

  
  export const facetConfig: Record<string, FacetConfigItem[]> = {
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
        {key: "rawData.Side", label: "Sidetall"},
        {key: "rawData.Gnr", label: "Gardsnummer"},
        {key: "rawData.Bnr", label: "Bruksnummer"},
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