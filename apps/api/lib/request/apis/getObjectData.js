import { SPARQL_PREFIXES } from '../../constants';

export async function getObjectData(id, url) {
  if (!id) {
    throw Error;
  }

  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri ?p ?o ;
        a crm:E22_Human-Made_Object ;
        rdfs:label ?label ;
        muna:image ?image ;
        muna:subjectOfManifest ?manifest ;
        foaf:homepage ?homepage .
      ?o a ?oClass ;
        dct:identifier ?identifier ;
        rdfs:label ?oLabel ;
        wgs:long ?long ;
        wgs:lat ?lat .
    } WHERE { 
      VALUES ?id {"${id}"}
      ?uri dct:identifier ?id ;
        ?p ?o .
      OPTIONAL {?uri ubbont:hasRepresentation  ?repr } .
      OPTIONAL {?uri dct:title ?title } .
      OPTIONAL {?uri foaf:name ?name } .
      OPTIONAL {?uri skos:prefLabel ?prefLabel } .
      OPTIONAL {?uri rdfs:label ?rdfsLabel } .
      BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
      # Get multipage image
      OPTIONAL { 
        ?uri ubbont:hasRepresentation / dct:hasPart ?page .
        ?page ubbont:sequenceNr 1 .
        ?page ubbont:hasResource ?resource .
        OPTIONAL {?resource ubbont:hasSMView ?smImage.}  
        OPTIONAL {?resource ubbont:hasMDView ?mdImage.}
      }
      # Get singlepage image
      OPTIONAL { 
        ?uri ubbont:hasRepresentation / dct:hasPart ?part .
        OPTIONAL {?part ubbont:hasMDView ?imgMD .}
        OPTIONAL {?part ubbont:hasSMView ?imgSM .} 
      }
      BIND (COALESCE(?imgMD,?imgSM,?mdImage,?smImage) AS ?image) .
      OPTIONAL {
        ?o a ?oClass ;
          (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel .
        OPTIONAL {?o dct:identifier ?identifier } .
        OPTIONAL {
          ?o wgs:long ?long ;
            wgs:lat ?lat
        }
        FILTER(?oClass != rdfs:Class)
      }
      OPTIONAL { 
        ?uri dct:license / rdfs:label ?licenseLabel .
      }
      BIND(iri(REPLACE(str(?uri), "data.ub.uib.no","marcus.uib.no","i")) as ?homepage) .
      BIND(IF(BOUND(?repr),CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest"), ?repr) as ?manifest) .
      FILTER(?p != ubbont:cataloguer && ?p != ubbont:internalNote)
    }
  `;

  const results = await fetch(
    `${url}${encodeURIComponent(
      query
    )}&output=json`
  );
  return results;
}
