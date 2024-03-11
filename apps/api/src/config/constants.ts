export const SPARQL_PREFIXES: string = `
PREFIX muna: <http://muna.xyz/model/0.1/>
PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>
PREFIX ecrm: <http://erlangen-crm.org/current/>
PREFIX ubbont: <http://data.ub.uib.no/ontology/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX schema: <http://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bibo: <http://purl.org/ontology/bibo/>
PREFIX mo: <http://purl.org/ontology/mo/>
PREFIX geo-deling: <http://vocab.lenka.no/geo-deling#>
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX dcmitype: <http://purl.org/dc/dcmitype/>
PREFIX event: <http://purl.org/NET/c4dm/event.owl#>
PREFIX geonames: <http://www.geonames.org/ontology#>
PREFIX exif: <http://www.w3.org/2003/12/exif/ns#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX bio: <http://purl.org/vocab/bio/0.1/>
PREFIX frbr: <http://vocab.org/frbr/core#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX ore: <http://www.openarchives.org/ore/terms/>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/nie/#>
PREFIX locah: <http://data.archiveshub.ac.uk/def/>
PREFIX lexvo: <http://lexvo.org/ontology#>
PREFIX cc: <http://creativecommons.org/ns#>
PREFIX sc: <http://iiif.io/api/presentation/3#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX iiif_prezi: <http://iiif.io/api/presentation/3#>
PREFIX as: <http://www.w3.org/ns/activitystreams#>
`

export const DOMAIN = 'https://api.ub.uib.no'
export const API_URL: string = process.env.NODE_ENV === 'http://localhost:3009' ? DOMAIN : 'http://localhost:3009'

/**
 * This is a list of services that can be used to look up an id.
 * It is not thought through and should be replaced with a ETL strategy.
 */
export const DATA_SOURCES = [
  {
    name: "marcus",
    url: "https://sparql.ub.uib.no/sparql/query?query=",
    type: "sparql",
  },
  {
    name: "ska",
    url: "https://sparql.ub.uib.no/skeivtarkiv/query?query=",
    type: "sparql",
  },
  {
    name: "wab",
    url: "https://sparql.ub.uib.no/wab/query?query=",
    type: "sparql",
  },
  {
    name: "samla",
    lookupUrl: "https://viewer.samla.no/viewer/api/v1/index/query/",
    url: "https://viewer.samla.no/viewer/api/v2/records/${id}/manifest",
    type: "rest",
  },
  {
    name: "samlaCollection",
    url: "https://viewer.samla.no/viewer/api/v1/collections/DC/",
    type: "rest",
  },
  {
    name: "samlaCollections",
    url: "https://viewer.samla.no/viewer/api/v1/collections/DC",
    type: "rest",
  },
]

export type DataSource = typeof DATA_SOURCES[number]