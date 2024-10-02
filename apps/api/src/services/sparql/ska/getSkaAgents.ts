import { DATA_SOURCES } from '@config/constants';
import { isObjectEmpty } from '@lib/isObjectEmpty';
import * as jsonld from 'jsonld';
import contexts from 'jsonld-contexts';

const SKA_API = DATA_SOURCES.filter((service) => service.name === 'ska')[0].url;

export async function getSkaAgents() {
  const query = `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
  PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
  PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
  PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
  PREFIX dct: <http://purl.org/dc/terms/> 
  PREFIX bibo: <http://purl.org/ontology/bibo/> 
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
  PREFIX owl: <http://www.w3.org/2002/07/owl#> 
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
  PREFIX dbo: <http://dbpedia.org/ontology/> 
  CONSTRUCT { 
    ?s rdf:about ?s .
    ?s rdf:type ?subclass . 
    ?s skos:prefLabel ?preferredLabelStr .
    ?s foaf:name ?nameStr .
    ?s dbo:profession ?professionStr .
    ?s foaf:familyName ?familyNameStr .
    ?s foaf:firstName ?firstNameStr .
    ?s dbo:birthDate ?birthDateStr .
    ?s dbo:birthYear ?birthYearStr .
    ?s dbo:deathDate ?deathDateStr .
    ?s dbo:deathYear ?deathYearStr .
    ?s foaf:gender ?gender .
    ?s dct:dateAccepted ?dateAccepted .
    ?s foaf:based_near ?basedNearStr .
    ?s dbo:deathPlace ?deathPlaceStr .
    ?s dbo:birthPlace ?birthPlaceStr .
  } 
  WHERE { 
    GRAPH <urn:x-arq:UnionGraph> { 
      ?subclass rdfs:subClassOf* foaf:Agent . 
      ?s0 rdf:type ?subclass . 
      OPTIONAL { 
        ?s0 skos:prefLabel ?preferredLabel 
        BIND(str(?preferredLabel) as ?preferredLabelStr)
      } .
      OPTIONAL { 
        ?s0 foaf:name ?name 
        BIND(str(?name) as ?nameStr)
      } .
      OPTIONAL { 
        ?s0 dbo:profession ?profession 
        BIND(str(?profession) as ?professionStr)
      } .
      OPTIONAL { 
        ?s0 foaf:familyName ?familyName 
        BIND(str(?familyName) as ?familyNameStr)
      } .
      OPTIONAL { 
        ?s0 foaf:firstName ?firstName 
        BIND(str(?firstName) as ?firstNameStr)
      } .
      OPTIONAL { 
        ?s0 foaf:based_near/skos:prefLabel ?basedNear 
        BIND(str(?basedNear) as ?basedNearStr)
      } .
      OPTIONAL { 
        ?s0 dbo:deathPlace/skos:prefLabel ?deathPlace 
        BIND(str(?deathPlace) as ?deathPlaceStr)
      } .
      OPTIONAL { 
        ?s0 dbo:birthPlace/skos:prefLabel ?birthPlace 
        BIND(str(?birthPlace) as ?birthPlaceStr)
      } .
      OPTIONAL { 
        ?s0 dbo:birthDate ?birthDate 
        BIND(str(?birthDate) as ?birthDateStr)
      } .
      OPTIONAL { 
        ?s0 dbo:birthYear ?birthYear 
        BIND(str(?birthYear) as ?birthYearStr)
      } .
      OPTIONAL { 
        ?s0 dbo:deathDate ?deathDate 
        BIND(str(?deathDate) as ?deathDateStr)
      } .
      OPTIONAL { 
        ?s0 dbo:deathYear ?deathYear 
        BIND(str(?deathYear) as ?deathYearStr)
      } .
      OPTIONAL { ?s0 foaf:gender ?gender } .
      OPTIONAL { ?s0 dct:dateAccepted ?dateAccepted } .
      BIND(iri(replace(str(?s0), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?s) 
    } 
  }`

  try {
    const result = await fetch(
      `${SKA_API}${encodeURIComponent(
        query
      )}&output=json`).then((res: any) => res.json());

    if (isObjectEmpty(result)) {
      return []
    }

    // Expand and compact the result using the legacy context
    const expanded = await jsonld.expand(result)
    const compacted = await jsonld.compact(expanded, contexts.skaLegacyContext)

    return compacted['@graph'];
  } catch (error) {
    return error;
  }
}