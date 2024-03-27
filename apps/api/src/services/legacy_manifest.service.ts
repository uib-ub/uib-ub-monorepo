import { JsonLd } from 'jsonld/jsonld-spec'
import { API_URL, SPARQL_PREFIXES } from '../config/constants'
import compactAndFrameNTriples from '../helpers/compactAndFrameNTriples'
import fetch from '../helpers/fetchRetry'
import { constructManifest } from '../helpers/mappers/constructManifest'

export type TFailure = {
  error: boolean
  message: unknown
}

function getQuery(id: string) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT { 
      ?manifestURL rdf:type sc:Manifest .
      ?manifestURL dct:identifier ?id .
      ?manifestURL dct:language ?lang .
      ?manifestURL rdfs:label ?label .
      ?manifestURL rdfs:seeAlso ?s .
      ?manifestURL sc:homepage ?homepage .
      ?manifestURL as:summary ?desc .
      ?manifestURL sc:thumbnail ?thumbString .
      ?manifestURL sc:items ?part .
      ?manifestURL sc:items ?singleCanvas .
      ?manifestURL sc:structures ?rangeURL .
      ?rangeURL rdf:type sc:Range .
      ?rangeURL sc:items ?part .
      ?rangeURL sc:items ?singleCanvas .
      ?part rdf:type sc:Canvas .
      ?part rdfs:label ?itemLabel .
      ?part sc:thumbnail ?canvasThumb .
      ?part sc:items ?resource .
      ?resource rdf:type oa:Annotation .
      ?resource ubbont:hasXLView ?partXLString ;
        ubbont:hasMDView ?partMDString ; 
        ubbont:hasSMView ?partSMString .
      ?singleCanvas rdf:type sc:Canvas .
      ?singleCanvas rdfs:label "1" .
      ?singleCanvas sc:thumbnail ?singleCanvasThumb .
      ?singleCanvas sc:items ?singlePart .
      ?singlePart rdf:type oa:Annotation ;
        ubbont:hasXLView ?singleXLString ;
        ubbont:hasMDView ?singleMDString ; 
        ubbont:hasSMView ?singleSMString .
    }
    WHERE { 
      VALUES ?id { "${id}" }
      ?s dct:identifier ?id ;
        rdf:type/rdfs:subClassOf* bibo:Document ;
        ubbont:hasRepresentation ?repr ;
        ubbont:hasThumbnail ?thumb .
      OPTIONAL {?s dct:language/dct:identifier ?lang } .
      OPTIONAL {?s dct:title ?title } .
      OPTIONAL {?s foaf:name ?name } .
      OPTIONAL {?s skos:prefLabel ?prefLabel } .
      OPTIONAL {?s rdfs:label ?rdfsLabel } .
      BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, "Mangler tittel") AS ?label) .
      OPTIONAL { ?s dct:description ?desc } .
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
      BIND(iri(concat("${API_URL}", "/items/", ?id, "?as=iiif")) AS ?manifestURL)
      BIND(iri(concat("http://data.ub.uib.no/instance/", ?id, "/manifest/range/1")) AS ?rangeURL)
      BIND(iri(concat("http://data.ub.uib.no/instance/page/", ?id, "_p1")) AS ?singleCanvas)
      BIND(iri(replace(str(?s), "data.ub.uib.no", "marcus.uib.no", "i")) AS ?homepage)
      BIND(str(?seq) AS ?itemLabel)
      BIND(str(?thumb) AS ?thumbString)
      BIND(str(?singleSM) AS ?singleSMString)
      BIND(str(?singleMD) AS ?singleMDString)
      BIND(str(?singleXL) AS ?singleXLString)
      BIND(str(?partSM) AS ?partSMString)
      BIND(str(?partMD) AS ?partMDString)
      BIND(str(?partXL) AS ?partXLString)
    }
    ORDER BY ?s ?repr ?part ?resource`

  return query
}

export async function getManifestData(id: string, source: string, context: string, type: string): Promise<JsonLd | TFailure> {
  const url = `${source}${encodeURIComponent(getQuery(id))}&output=nt`

  try {
    const response = await fetch(url)
    const results = await response.text()

    if (!results) return { error: true, message: 'Not found' }

    let data: any = await compactAndFrameNTriples(
      results,
      context,
      type
    )
    data = constructManifest(data, API_URL, source)

    return data
  } catch (error) {
    console.error(error);
    throw error;
  }
}
