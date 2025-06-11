import { endpointUrl } from '@/clients/sparql-chc-client';
import { SPARQL_PREFIXES } from '../../constants';
import jsonld, { JsonLdDocument, ContextDefinition } from 'jsonld';
import ubbontContext from 'jsonld-contexts/src/ubbontContext';
import { sqb, useFrame, normalizeJsonLdToArray } from 'utils';

export type UbbontItem = {
  [key: string]: any;
}

const query = `
  ${SPARQL_PREFIXES}
  CONSTRUCT { 
    ?s a ore:Aggregation ;
      rdfs:label ?id ;
      dct:hasPart ?singleCanvas ;
      dct:hasPart ?parts .
    ?singleCanvas a ubbont:Page ; 
      rdfs:label "side 1" ;
      ubbont:sequenceNr 1 ;
      ubbont:hasResource ?part .
    ?part ?p2 ?singlePartProps .
    ?parts rdfs:label ?partsLabel ;
      ubbont:sequenceNr ?partsSeq ;
      ubbont:hasResource ?partsResource .
    ?partsResource ?p3 ?o3 .
  }
  WHERE { 
  VALUES ?id { "%id" }
    ?s rdfs:label ?id ;
       a ore:Aggregation .
    OPTIONAL { 
      ?s dct:hasPart ?part .
      ?part ?p2 ?singlePartProps ;
        a ubbont:DigitalResource .
      FILTER(?p2 != ubbont:isResourceOf )
      FILTER(?p2 != rdfs:type )
    }
    OPTIONAL { 
      ?s dct:hasPart ?parts .
      ?parts a ubbont:Page ;
         rdfs:label ?partsLabel ;
         ubbont:sequenceNr ?partsSeq ;
         ubbont:hasResource ?partsResource .
       ?partsResource ?p3 ?o3 .
       FILTER(?p3 != ubbont:isResourceOf )
       FILTER(?p3 != rdfs:type )
    }
    BIND(iri(concat("http://data.ub.uib.no/instance/page/", ?id, "_p1")) AS ?singleCanvas)
  }
`

export const fetchFileset = async (id: string): Promise<UbbontItem> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { id }))}&output=nt`)
  const results: unknown = await response.text() // We get the data as NTriples
  // We get the data as NTriples, so we need to convert it to JSON-LD
  const json = await jsonld.fromRDF(results as object)

  return json;
};


export const frameFileSet = async (data: UbbontItem): Promise<JsonLdDocument> => {
  const framed: JsonLdDocument = await useFrame({
    data: data,
    context: ubbontContext as ContextDefinition,
    type: 'Aggregation',
    id: data.id
  })

  let cleaned = normalizeJsonLdToArray(framed)[0]
  // Sort the hasPart property in cleaned
  cleaned.hasPart = cleaned.hasPart.sort((a: any, b: any) => parseInt(a.sequenceNr) - parseInt(b.sequenceNr))

  return {
    id: cleaned._label.none[0],
    data: cleaned
  };
}

export const fetchAndProcessFileset = async (id: string): Promise<JsonLdDocument> => {
  const item = await fetchFileset(id);
  const framed = await frameFileSet(item);
  return framed;
} 