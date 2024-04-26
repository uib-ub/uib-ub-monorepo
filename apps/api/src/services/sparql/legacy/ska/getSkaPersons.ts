import jsonld from 'jsonld';
import { isObjectEmpty } from '../../../../helpers/isObjectEmpty';
import { DATA_SOURCES } from '../../../../config/constants';
import contexts from 'jsonld-contexts';

const SKA_API = DATA_SOURCES.filter((service) => service.name === 'ska')[0].url;

export async function getSkaPersons() {
  const query = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    PREFIX owl: <http://www.w3.org/2002/07/owl#> 
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
    PREFIX dct: <http://purl.org/dc/terms/> 
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#> 
    PREFIX bio: <http://purl.org/vocab/bio/0.1/> 
    PREFIX bibo: <http://purl.org/ontology/bibo/> 
    PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
    PREFIX dbo: <http://dbpedia.org/ontology/> 
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
    
    CONSTRUCT { 
      ?sR <http://purl.org/dc/terms/identifier> ?identifier . 
      ?sR <http://www.w3.org/2000/01/rdf-schema#label> ?label . 
      ?sR <http://dbpedia.org/ontology/birthDate> ?birthDate . 
      ?sR <http://dbpedia.org/ontology/deathDate> ?deathDate . 
      ?sR <http://dbpedia.org/ontology/profession> ?profession. 
      ?sR <http://www.w3.org/2004/02/skos/core#altLabel> ?altLabel . 
      ?sR <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?classLabel .
      ?sR <http://xmlns.com/foaf/0.1/img> ?img . 
      ?sR <http://schema.org/honorificPrefix> ?prefix . 
      ?sR <http://xmlns.com/foaf/0.1/name> ?name .
      ?sR <http://xmlns.com/foaf/0.1/familyName> ?familyName . 
      ?sR <http://xmlns.com/foaf/0.1/firstName> ?firstName . 
      ?sR <http://xmlns.com/foaf/0.1/gender> ?gender .
      ?sR <http://dbpedia.org/ontology/birthName> ?birthName . 
    } 
    WHERE { 
      GRAPH <urn:x-arq:UnionGraph> {
        ?s a foaf:Person . 
        ?s a ?class . 
        OPTIONAL {?s <http://purl.org/dc/terms/identifier> ?identifier .} 
        OPTIONAL {?s <http://www.w3.org/2000/01/rdf-schema#label> ?label .} 
        OPTIONAL {?s <http://dbpedia.org/ontology/birthDate> ?birthDate0 .} 
        OPTIONAL {?s <http://dbpedia.org/ontology/deathDate> ?deathDate0 .} 
        OPTIONAL {?s <http://dbpedia.org/ontology/profession> ?profession.} 
        OPTIONAL {?s <http://www.w3.org/2004/02/skos/core#altLabel> ?label .} 
        OPTIONAL {?s <http://xmlns.com/foaf/0.1/img> ?img .} 
        OPTIONAL {?s <http://schema.org/honorificPrefix> ?prefix .} 
        OPTIONAL {?s <http://xmlns.com/foaf/0.1/name> ?name .} 
        OPTIONAL {?s <http://xmlns.com/foaf/0.1/familyName> ?familyName .} 
        OPTIONAL {?s <http://xmlns.com/foaf/0.1/firstName> ?firstName .} 
        OPTIONAL {?s <http://xmlns.com/foaf/0.1/gender> ?gender .} 
        OPTIONAL {?s <http://dbpedia.org/ontology/birthName> ?birthName .} 
        BIND (str(?birthDate0) AS ?birthDate) 
        BIND (str(?deathDate0) AS ?deathDate) 
        BIND (iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR ) 
      } 
      GRAPH ubbont:ubbont { 
        ?class rdfs:label ?classLabel . 
        FILTER (langMatches(lang(?classLabel), "")) 
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