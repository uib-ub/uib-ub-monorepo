import { SPARQL_PREFIXES } from '@config/constants'
import fetch from '@lib/fetchRetry'
import { sqb } from '@lib/sparqlQueryBuilder'
import { toFileSetTransformer } from '@transformers/file_set.transformer'
import { HTTPException } from 'hono/http-exception'
import jsonld from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { JsonLd } from 'jsonld/jsonld-spec'

export const filesetSparqlQuery = `
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

export async function getFileSet(id: string, source: string): Promise<JsonLd> {
  const query = sqb(filesetSparqlQuery, { id })
  const url = `${source}${encodeURIComponent(query)}&output=nt`

  try {
    const response = await fetch(url)
    const results: unknown = await response.text() // We get the data as NTriples

    if (!results) {
      return {
        error: true,
        message: 'ID not found.'
      }
    }

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const json = await jsonld.fromRDF(results as object)

    const data = await toFileSetTransformer(json, ubbontContext)
    return data;
  } catch (error) {
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}
