import { JsonLd } from 'jsonld/jsonld-spec'
import { SPARQL_PREFIXES } from '../config/constants'
import compactAndFrameNTriples from '../helpers/frameJsonLd'
import fetch from '../helpers/fetchRetry'
import { removeStringsFromArray } from '../helpers/removeStringsFromArray'

function getQuery(id: string) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri ?p ?o ;
        a crm:E22_Human-Made_Object ;
        crm:P2_has_type ?type ;
        dct:title ?label ;
        dct:created ?created ;
        rdfs:label ?label ;
        muna:image ?image ;
        ubbont:hasThumbnail ?thumbString ;
        muna:subjectOfManifest ?manifest ;
        foaf:homepage ?homepage .
      ?o a ?oClass ;
        dct:identifier ?identifier ;
        rdfs:label ?oLabel ;
        wgs:long ?longDouble ;
        wgs:lat ?latDouble .
    } WHERE { 
      VALUES ?id {"${id}"}
      ?uri dct:identifier ?id ;
        ?p ?o ;
        a ?class .
      OPTIONAL {?uri ubbont:hasThumbnail ?thumb } .
      BIND(str(?thumb) AS ?thumbString)
      OPTIONAL {?uri dct:title ?title } .
      OPTIONAL {?uri foaf:name ?name } .
      OPTIONAL {?uri skos:prefLabel ?prefLabel } .
      OPTIONAL {?uri rdfs:label ?rdfsLabel } .
      BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, ?id) AS ?label) .
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
        ?o a ?oClass .
        OPTIONAL { ?o dct:identifier ?identifier } .
        OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
        OPTIONAL {
          ?o wgs:long ?long ;
            wgs:lat ?lat .
        }
        FILTER(?oClass != rdfs:Class) .
      }
      OPTIONAL { 
        ?uri dct:license / rdfs:label ?licenseLabel .
      }
      FILTER(?o != ?uri)
      BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
      BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
      BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
      BIND(IF(?isDigitized, CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest"), "") as ?manifest)
      BIND(xsd:double(?long) as ?longDouble)
      BIND(xsd:double(?lat) as ?latDouble)
      FILTER(?p NOT IN (rdf:type, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail))
    }`

  return query
}
export async function getItemData(id: string, source: string, context: string, type: string): Promise<JsonLd> {
  const url = `${source}${encodeURIComponent(getQuery(id))}&output=nt`
  try {
    const response = await fetch(url)

    const results = await response.text()

    let data: any = await compactAndFrameNTriples(
      results,
      context,
      type
    )
    // Clean up
    data['@context'] = context
    data = removeStringsFromArray(data)
    // Change id as this did not work in the query
    data.id = `${data.identifier}`
    // We assume all @none language tags are really norwegian
    data = JSON.parse(JSON.stringify(data).replaceAll('"none":', '"no":'))
    data.provenance = typeof data.provenance === 'string' ? data.provenance : data.provenance?._label ?? undefined

    // @TODO: Remove this when we have dct:modified on all items in the dataset
    data._modified = data._modified ?? "2020-01-01T00:00:00"

    return data
  } catch (error) {
    console.error(error);
    throw error;
  }
}
