import { DATA_SOURCES } from '@config/constants';
import { isObjectEmpty } from '@helpers/isObjectEmpty';
import * as jsonld from 'jsonld';
import contexts from 'jsonld-contexts';

const SKA_API = DATA_SOURCES.filter((service) => service.name === 'ska')[0].url;

export async function getSkaObjects() {
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
    PREFIX event: <http://purl.org/NET/c4dm/event.owl#> 
    CONSTRUCT { 
      ?sR rdf:type ?classLabel . 
      ?sR dct:identifier ?identifier . 
      ?sR rdfs:label ?label . 
      ?sR dct:isPartOf ?collection . 
      ?sR event:producedIn ?event . 
      ?sR dct:description ?description . 
      ?sR foaf:maker ?maker . 
      ?sR dct:spatial ?spatial . 
      ?sR dct:created ?created . 
      ?sR dct:subject ?topic . 
      ?sR dct:relation ?relation . 
      ?sR ubbont:hasThumbnail ?thumb .
    } 
    WHERE { 
      {
        GRAPH <urn:x-arq:UnionGraph> { 
          ?s rdf:type ubbont:Object . 
          ?s rdf:type ?class 
          OPTIONAL { ?s dct:identifier ?identifier} 
          OPTIONAL { ?s dct:created ?created0} 
          OPTIONAL { ?s dct:title ?title} 
          OPTIONAL { ?s rdfs:label ?label2} 
          OPTIONAL { ?s skos:prefLabel ?prefLabel} 
          OPTIONAL { ?s dct:spatial/skos:prefLabel ?spatial} 
          OPTIONAL { ?s dct:description ?description} 
          OPTIONAL { ?s dct:relation/foaf:name ?relation} 
          OPTIONAL { ?s dct:subject/skos:prefLabel ?topic} 
          OPTIONAL { ?s foaf:maker/foaf:name ?maker} 
          OPTIONAL { ?s dct:isPartOf/dct:title ?collection} 
          OPTIONAL { ?s event:producedIn/skos:prefLabel ?event} 
          OPTIONAL { ?s ubbont:hasThumbnail ?thumb} 
          BIND(str(?created0) AS ?created) 
          BIND(iri(replace(str(?s), "data.ub.uib.no", "katalog.skeivtarkiv.no")) AS ?sR) 
          BIND(coalesce(?title, ?label2, ?prefLabel, ?identifier) AS ?label) 
        } 
        GRAPH ubbont:ubbont { 
          ?class rdfs:label ?classLabel 
          FILTER langMatches(lang(?classLabel), "") 
        } 
      } 
      UNION 
      { 
        GRAPH <urn:x-arq:UnionGraph> { 
          ?subclass (rdfs:subClassOf)* ubbont:Object . 
          ?s rdf:type ?subclass 
          OPTIONAL { ?s dct:identifier ?identifier} 
          OPTIONAL { ?s dct:created ?created0} 
          OPTIONAL { ?s dct:title ?title} 
          OPTIONAL { ?s rdfs:label ?label2} 
          OPTIONAL { ?s skos:prefLabel ?prefLabel} 
          OPTIONAL { ?s dct:spatial/skos:prefLabel ?spatial} 
          OPTIONAL { ?s dct:description ?description} 
          OPTIONAL { ?s dct:relation/foaf:name ?relation} 
          OPTIONAL { ?s dct:subject/skos:prefLabel ?topic} 
          OPTIONAL { ?s foaf:maker/foaf:name ?maker} 
          OPTIONAL { ?s dct:isPartOf/dct:title ?collection} 
          OPTIONAL { ?s event:producedIn/skos:prefLabel ?event} 
          OPTIONAL { ?s ubbont:hasThumbnail ?thumb} BIND(str(?created0) AS ?created) 
          BIND(iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR) 
          BIND(coalesce(?title, ?label2, ?prefLabel, ?identifier) AS ?label) 
        } 
        GRAPH ubbont:ubbont { 
          ?subclass rdfs:label ?classLabel FILTER langMatches(lang(?classLabel), "")
        }
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