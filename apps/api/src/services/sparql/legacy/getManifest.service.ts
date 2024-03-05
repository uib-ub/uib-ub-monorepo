import { JsonLd } from 'jsonld/jsonld-spec'
import { DOMAIN, SPARQL_PREFIXES } from '../../../config/constants'
import compactAndFrameNTriples from '../../../helpers/frameJsonLd'
import fetch from '../../../helpers/fetchRetry'
import { constructManifest } from '../../../helpers/constructManifest'

function getQuery(id: string) {
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
      ?part rdfs:label ?itemLabel .
      ?part sc:thumbnail ?canvasThumb .
      ?part sc:items ?resource .
      ?resource rdf:type oa:Annotation .
      ?resource ubbont:hasXLView ?partXL ;
        ubbont:hasMDView ?partMD ; 
        ubbont:hasSMView ?partSM .
      ?singleCanvas rdf:type sc:Canvas .
      ?singleCanvas rdfs:label "1" .
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
        BIND(iri(concat("${DOMAIN}", "/items/", ?id, "/manifest")) AS ?manifestURL)
        BIND(iri(concat("http://data.ub.uib.no/instance/", ?id, "/manifest/range/1")) AS ?rangeURL)
        BIND(iri(concat("http://data.ub.uib.no/instance/page/", ?id, "_p1")) AS ?singleCanvas)
        BIND(iri(replace(str(?s), "data.ub.uib.no", "marcus.uib.no", "i")) AS ?homepage)
        BIND(str(?seq) AS ?itemLabel)
      }
    }
    ORDER BY ?s ?repr ?part ?resource`

  return query
}

export async function getManifestData(id: string, source: string, context: string, type: string): Promise<JsonLd> {
  const url = `${source}${encodeURIComponent(getQuery(id))}&output=nt`
  try {
    const response = await fetch(url)

    const results = await response.text()

    let data: any = await compactAndFrameNTriples(
      results,
      context,
      type
    )
    data = constructManifest(data, DOMAIN, source)

    return data
  } catch (error) {
    console.error(error);
    throw error;
  }
}
