import jsonld, { ContextDefinition } from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'
import omitEmptyEs from 'omit-empty-es'
import { HumanMadeObjectSchema } from 'types'
import { SPARQL_PREFIXES } from '../config/constants'
import { env } from '../config/env'
import { cleanDateDatatypes } from '../helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '../helpers/cleaners/convertToFloat'
import { removeStringsFromArray } from '../helpers/cleaners/removeStringsFromArray'
import fetch from '../helpers/fetchRetry'
import { constructCoreMetadata } from '../helpers/mappers/la/person/constructCoreMetadata'
import { constructLifetimeTimespan } from '../helpers/mappers/la/person/constructLifetimeTimespan'
import { constructAboutness } from '../helpers/mappers/la/shared/constructAboutness'
import { constructAssertions } from '../helpers/mappers/la/shared/constructAssertions'
import { constructDigitalIntegration } from '../helpers/mappers/la/shared/constructDigitalIntegration'
import { constructIdentifiers } from '../helpers/mappers/la/shared/constructIdentifiers'
import { constructSubjectTo } from '../helpers/mappers/la/shared/constructSubjectTo'
import jsonSchemaValidator from '../helpers/validators/jsonSchemaValidator'
import { TBaseMetadata, TFailure } from '../models'

function getQuery(id: string) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri ?p ?o ;
        a ?class ;
        crm:P2_has_type ?type ;
        dct:created ?created ;
        rdfs:label ?label ;
        foaf:homepage ?homepage .
      ?o a ?oClass ;
        ?p2 ?o2 ;
        dct:identifier ?identifier ;
        rdfs:label ?oLabel ;
        ubbont:hasURI ?oURI .
    } WHERE { 
      VALUES ?id {"${id}"}
      ?uri dct:identifier ?id ;
        foaf:name ?name ;
        ?p ?o ;
        a ?class .
      OPTIONAL {?uri dct:title ?title } .
      OPTIONAL {?uri foaf:name ?name } .
      OPTIONAL {?uri skos:prefLabel ?prefLabel } .
      OPTIONAL {?uri rdfs:label ?rdfsLabel } .
      BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, ?id) AS ?label) .
      OPTIONAL { 
        ?o a ?oClass .
        OPTIONAL { ?o dct:identifier ?identifier } .
        OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
        OPTIONAL { ?o foaf:gender ?gender } .
        OPTIONAL { ?o ubbont:hasURI ?oURI } .
        FILTER(?oClass != rdfs:Class) .
      }
      FILTER(?o != ?uri)
      BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
      BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
      FILTER(?p NOT IN (rdf:type, ubbont:reproduced, foaf:depiction, skos:inScheme, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, foaf:made))
    }`

  return query
}

async function getPersonData(id: string, source: string, context: string, type: string): Promise<HumanMadeObjectSchema | TFailure> {
  const url = `${source}${encodeURIComponent(getQuery(id))}&output=nt`
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  try {
    const response = await fetch(url)
    const results: unknown = await response.text()

    if (!results) {
      return {
        error: true,
        message: 'ID not found, or the object have insufficient metadata'
      }
    }

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const json = await jsonld.fromRDF(results as object)

    // Since we have an array of rdf objects, it is convenient to do some data cleaning here
    const fixedDates = cleanDateDatatypes(json)
    const withFloats = convertToFloat(fixedDates)

    // Compact the data to make it easier to work with
    const compacted = await jsonld.compact({
      '@graph': withFloats
    }, useContext as ContextDefinition
    )

    const hasTypeAsString = ((compacted['@graph'] as any).filter((i: any) => i.identifier === id)[0]?.hasType as string).toLowerCase() ?? (compacted.hasType as string).toLowerCase()

    let data: any

    try {
      const framed = jsonld.frame(compacted, {
        ...useContext,
        '@id': `http://data.ub.uib.no/instance/${hasTypeAsString}/${id}`,
        '@embed': '@always',
      });
      data = omitEmptyEs(await framed)
    } catch (error) {
      //console.log(JSON.stringify(error, null, 2))
      return { error: true, message: error }
    }

    // We assume all @none language tags are really norwegian
    data = JSON.parse(JSON.stringify(data).replaceAll('"none":', '"no":'))
    // Removes non-object items from the specified properties of the input data array.
    data = removeStringsFromArray(data)

    // Remove the inline context and add the url to the context
    data['@context'] = context

    // @TODO: Remove this when we have dct:modified on all items in the dataset
    data._modified = data._modified ?? "2020-01-01T00:00:00"

    const base: TBaseMetadata = {
      identifier: data.identifier,
      context: ['https://linked.art/ns/v1/linked-art.json', context],
      newId: `${env.API_URL}/people/${data.uuid ?? data.identifier}`,
      originalId: data.id,
      _label: data._label,
    }

    // Construct LinkedArt
    data = constructCoreMetadata(base, data)
    data = constructIdentifiers(data)
    data = constructLifetimeTimespan(data)
    data = constructDigitalIntegration(data)
    data = await constructAboutness(data)
    data = constructAssertions(data)
    data = constructSubjectTo(base, data)

    // Validate the data
    const validate = jsonSchemaValidator.getSchema("person.json")

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

export default getPersonData