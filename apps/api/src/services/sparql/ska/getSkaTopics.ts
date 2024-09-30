import { DATA_SOURCES } from '@config/constants';
import { isObjectEmpty } from '@lib/isObjectEmpty';
import * as jsonld from 'jsonld';
import contexts from 'jsonld-contexts';

const SKA_API = DATA_SOURCES.filter((service) => service.name === 'ska')[0].url;

export async function getSkaTopics() {
  const query = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
  PREFIX xsd:<http://www.w3.org/2001/XMLSchema#> 
  PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
  PREFIX owl:<http://www.w3.org/2002/07/owl#> 
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
  PREFIX dct: <http://purl.org/dc/terms/> 
  PREFIX bibo:<http://purl.org/ontology/bibo/> 
  PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
  PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
  CONSTRUCT {
    ?sR skos:prefLabel ?label . 
    ?sR rdf:type ?classLabel . 
  } 
  WHERE { 
    GRAPH <urn:x-arq:UnionGraph> { 
      ?uri a skos:Concept. 
      ?uri a ?class . 
      ?uri skos:prefLabel ?label. 
      FILTER EXISTS {?uri ubbont:isSubjectOf ?subject } 
      BIND (iri(replace(str(?uri), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR )
    } 
    GRAPH ubbont:ubbont { 
      ?class rdfs:label ?classLabel .
       FILTER (langMatches(lang(?classLabel),"")) 
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