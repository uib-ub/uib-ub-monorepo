import { DOMAIN, SPARQL_PREFIXES } from '../config/constants'
import fetch from '../helpers/fetchRetry'
import { removeStringsFromArray } from '../helpers/cleaners/removeStringsFromArray'
import jsonld, { ContextDefinition } from 'jsonld'
import { cleanDateDatatypes } from '../helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '../helpers/cleaners/convertToFloat'
import { constructProduction } from '../helpers/mappers/constructProduction'
import { constructCollection } from '../helpers/mappers/constructCollection'
import { constructDigitalIntegration } from '../helpers/mappers/constructDigitalIntegration'
import { constructAboutness } from '../helpers/mappers/constructAboutness'
import { constructAssertions } from '../helpers/mappers/constructAssertions'
import { constructIdentifiers } from '../helpers/mappers/constructIdentifiers'
import { CONTEXTS } from 'jsonld-contexts'
import { TFailure } from '../models'
import { HumanMadeObjectSchema } from 'types'
import omitEmptyEs from 'omit-empty-es'
import ajv from '../helpers/validator'

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
        ?p2 ?o2 ;
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
        ?o a ?oClass ;
          ?p2 ?o2 .
          FILTER(?p2 NOT IN (dct:hasPart, ubbont:isSubjectOf, ubbont:locationFor, foaf:made, ubbont:techniqueOf, ubbont:cataloguer, ubbont:isRightsHolderOf, skos:narrower, skos:broader, ubbont:ownedBy, dct:references, dct:isPartOf, dct:subject, dct:spatial, dct:isReferencedBy, ubbont:technique, bibo:owner, dct:relation, ubbont:reproduced, foaf:depiction, foaf:page))
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

async function getItemData(id: string, source: string, context: string, type: string): Promise<HumanMadeObjectSchema | TFailure> {
  const url = `${source}${encodeURIComponent(getQuery(id))}&output=nt`
  // @TODO: Add support for multiple contexts?
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  try {
    const response = await fetch(url)
    const results: unknown = await response.text()

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const json = await jsonld.fromRDF(results as object)

    // Since we have an array of rdf objects, it is convenient to do some data cleaning here
    const fixedDates = cleanDateDatatypes(json)
    const withFloats = convertToFloat(fixedDates)

    // Compact the data to make it easier to work with
    const compacted = await jsonld.compact({
      '@graph': withFloats
    },
      useContext as ContextDefinition
    ) // Compact to JSON-LD

    let data: any

    try {
      const framed = jsonld.frame(compacted, {
        ...useContext as ContextDefinition,
        '@type': type,
        '@embed': '@always',
      });
      data = omitEmptyEs(await framed)
    } catch (e) {
      console.log(JSON.stringify(e, null, 2))
      return { error: true, message: e }
    }

    // Remove the inline context and add the url to the context
    data['@context'] = ['https://linked.art/ns/v1/linked-art.json', context]
    // We assume all @none language tags are really norwegian
    data = JSON.parse(JSON.stringify(data).replaceAll('"none":', '"no":'))
    // Removes non-object items from the specified properties of the input data array.
    data = removeStringsFromArray(data)

    // Change id as this did not work in the query
    data.id = `${DOMAIN}/items/${data.identifier}`

    // Add provenance as a string. @TODO: Remove this when we have dct:provenance on all items in the dataset
    data.provenance = typeof data.provenance === 'string' ? data.provenance : data.provenance?._label ?? undefined

    // @TODO: Remove this when we have dct:modified on all items in the dataset
    data._modified = data._modified ?? "2020-01-01T00:00:00"

    // Construct LinkedArt
    data = constructIdentifiers(data)
    data = constructProduction(data)
    data = constructCollection(data)
    data = constructDigitalIntegration(data)
    data = constructAboutness(data)
    data = constructAssertions(data)

    // Validate the data
    const validate = ajv.getSchema("object.json")

    if (validate) {
      const valid = validate(data)
      if (!valid) {
        console.log(validate.errors)
        // throw new Error('Validation failed')
      }
    }

    return data
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default getItemData