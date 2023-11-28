export const samlingMapping = {
  MRT: 3000,
  MRT2: 3002,
  UHR: 3004,
  ARTSDB: 3006,
  EVERTEBRATER: 3008,
  NHH: 3010,
  NOJU: 3012,
  NOT: 3014,
  RTT: 3016,
  SDIR: 3018,
  TOLKING: 3022,
  ROMFYS: 3024,
  OKADM: 3026,
  UDEUT: 3028,
  FBK: 3030,
  ELTEK: 3032,
  TOT: 3034,
  SEMANTIKK: 3036,
  KUNNBP: 3038,
  DIGKULT: 3040,
  // 37xx
  DOMENE: 3702,
  // 38xx
  KLIMA: 3802,
  ASTRONOMI: 3804,
  BIOLOGI: 3806,
  LINGVISTIKK: 3808,
  CMBIOLOGI: 3810,
  KJEMI: 3812,
  BIBINF: 3814,
  // 39xx
  TUNDUIA: 3900,
};

export const prefix = `
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
PREFIX text: <http://jena.apache.org/text#>
PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
PREFIX skosno: <https://data.norge.no/vocabulary/skosno#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
`;
