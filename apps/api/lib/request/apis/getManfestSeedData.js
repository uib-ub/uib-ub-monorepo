import { getBaseUrl, SPARQL_PREFIXES } from '../../constants';

export async function getManfestSeedData(id, url) {
  if (!id)
    return new Error("Missing id");

  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT { 
      ?manifestURL rdf:type sc:Manifest .
      ?manifestURL dct:identifier ?id .
      ?manifestURL rdfs:label ?label .
      ?manifestURL rdfs:seeAlso ?s .
      ?manifestURL sc:homepage ?homepage .
      ?manifestURL as:summary ?desc .
      ?manifestURL sc:thumbnail ?thumb .
      ?manifestURL sc:items ?part .
      ?manifestURL sc:items ?singleCanvas .
      ?manifestURL sc:structures ?rangeURL .
      ?rangeURL rdf:type sc:Range .
      ?rangeURL sc:items ?part .
      ?rangeURL sc:items ?singleCanvas .
      ?part rdf:type sc:Canvas .
      ?part rdfs:label ?seq .
      ?part sc:thumbnail ?canvasThumb .
      ?part sc:items ?resource .
      ?resource rdf:type oa:Annotation .
      ?resource ubbont:hasXLView ?partXL ;
        ubbont:hasMDView ?partMD ; 
        ubbont:hasSMView ?partSM .
      ?singleCanvas rdf:type sc:Canvas .
      ?singleCanvas rdfs:label 1 .
      ?singleCanvas sc:thumbnail ?singleCanvasThumb .
      ?singleCanvas sc:items ?singlePart .
      ?singlePart rdf:type oa:Annotation ;
        ubbont:hasXLView ?singleXL ;
        ubbont:hasMDView ?singleMD ; 
        ubbont:hasSMView ?singleSM .
    }
    WHERE { 
      GRAPH ?g { 
        VALUES ?id { "${id}" }
        ?s dct:identifier ?id ;
          ubbont:hasRepresentation ?repr ;
          ubbont:hasThumbnail ?thumb .
        OPTIONAL {?s dct:title ?title } .
        OPTIONAL {?s foaf:name ?name } .
        OPTIONAL {?s skos:prefLabel ?prefLabel } .
        OPTIONAL {?s rdfs:label ?rdfsLabel } .
        BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, "Mangler tittel") AS ?label) .

        OPTIONAL { ?s dct:description  ?desc }
        OPTIONAL { 
          ?repr dct:hasPart ?singlePart ;
            rdfs:label ?partLabel .
          ?singlePart  ubbont:hasXSView  ?singleCanvasThumb ;
            ubbont:hasSMView ?singleSM .
          OPTIONAL { ?singlePart ubbont:hasMDView ?singleMD . }
          OPTIONAL { ?singlePart ubbont:hasXLView ?singleXL . }
        }
        OPTIONAL { 
          ?repr dct:hasPart ?part ;
            rdfs:label ?partLabel .
          ?part ubbont:hasResource ?resource ;
            ubbont:sequenceNr ?seq .
          ?resource ubbont:hasXSView ?canvasThumb ;
            ubbont:hasSMView ?partSM . 
          OPTIONAL { ?resource ubbont:hasMDView ?partMD . }
          OPTIONAL { ?resource ubbont:hasXLView ?partXL . }
        }
        BIND(iri(concat("${getBaseUrl()}", "/items/", ?id, "/manifest")) AS ?manifestURL)
        BIND(iri(concat("http://data.ub.uib.no/instance/manuscript/", ?id, "/manifest/range/1")) AS ?rangeURL)
        BIND(iri(concat("http://data.ub.uib.no/instance/page/", ?id, "_p1")) AS ?singleCanvas)
        BIND(iri(replace(str(?s), "data.ub.uib.no", "marcus.uib.no", "i")) AS ?homepage)
      }
    }
    ORDER BY ?s ?repr ?part ?resource
  `;

  const result = await fetch(
    `${url}${encodeURIComponent(
      query
    )}&output=json`);

  return result;
}
