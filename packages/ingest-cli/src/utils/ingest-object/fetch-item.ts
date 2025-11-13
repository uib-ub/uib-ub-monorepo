import { endpointUrl } from '@/clients/sparql-chc-client';
import { SPARQL_PREFIXES } from '../../constants';
import { sqb, useFrame } from 'utils';
import { JsonLdDocument, ContextDefinition } from 'jsonld';
import ubbontContext from 'jsonld-contexts/src/ubbontContext';
import { constructAboutness } from '../mappers/la/shared/constructAboutness';
import { constructDigitalIntegration } from '../mappers/la/shared/constructDigitalIntegration';
import { constructCoreMetadata } from '../mappers/la/object/constructCoreMetadata';
import { constructIdentifiers } from '../mappers/la/shared/constructIdentifiers';
import { constructProduction } from '../mappers/la/object/constructProduction';
import { constructCollection } from '../mappers/la/object/constructCollection';
import { constructDimension } from '../mappers/la/object/constructDimension';
import { constructAssertions } from '../mappers/la/shared/constructAssertions';
import { constructOwnership } from '../mappers/la/object/constructOwnership';
import { constructCorrespondance } from '../mappers/la/object/constructCorrespondance';
import { constructSubjectTo } from '../mappers/la/shared/constructSubjectTo';
import { ZodHumanMadeObjectSchema } from 'types';
import omitEmptyEs from 'omit-empty-es';
import { env } from '../../env';
import { removeStringsFromArray } from '../mappers/la/removeStringsFromArray';
import { getTimeSpan } from '../mappers/la/shared/constructTimeSpan';
import { observeClient } from '../../clients/es-client';

export type TBaseMetadata = {
  identifier: string,
  context: string[],
  newId: string,
  originalId: string,
  productionTimeSpan?: any,
  _label: any,
}

export type UbbontItem = {
  [key: string]: any;
}

export const fetchItemQuery = `
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
      ubbont:hasTranscription ?transcription ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?identifier ;
      rdfs:label ?oLabel ;
      wgs:long ?longDouble ;
      wgs:lat ?latDouble .
  } WHERE { 
    VALUES ?id {"%id"}
    ?uri dct:identifier ?id ;
      ?p ?o ;
      a ?class .
    OPTIONAL {?uri ubbont:hasThumbnail ?thumb } .
    BIND(str(?thumb) AS ?thumbString)
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
      ?uri ubbont:hasTranscription/ubbont:hasRepresentation/ubbont:hasURI ?transcription .
    }
    OPTIONAL { 
      ?o a ?oClass ;
        ?p2 ?o2 .
      FILTER(?p2 NOT IN (dct:hasPart, ubbont:isSubjectOf, ubbont:locationFor, foaf:made, ubbont:techniqueOf, ubbont:cataloguer, ubbont:isRightsHolderOf, skos:narrower, skos:broader, ubbont:ownedBy, dct:references, dct:isPartOf, dct:subject, dct:spatial, dct:isReferencedBy, ubbont:technique, bibo:owner, dct:relation, ubbont:reproduced, foaf:depiction, foaf:page, ubbont:formerOwnerOf, ubbont:commissioned, ubbont:originalCreatorOf, ubbont:published, dct:hasVersion, skos:inScheme, schema:sibling, schema:parent, schema:spouse))
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
    FILTER(STRENDS(STR(?uri), ?id))
    FILTER(?o != ?uri)
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
    BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
    BIND(xsd:double(?long) as ?longDouble)
    BIND(xsd:double(?lat) as ?latDouble)
    FILTER(?p NOT IN (rdf:type, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail, dct:relation, dc:relation, dct:isReferencedBy, ubbont:hasTranscription, skos:inScheme))
  }
`

export const fetchItem = async (id: string): Promise<UbbontItem> => {
  try {
    const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(fetchItemQuery, { id }))}&output=json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No data found for id: ${id}`);
    }
    return data;
  } catch (error) {
    throw new Error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const frameItem = async (data: UbbontItem): Promise<JsonLdDocument> => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Cannot frame empty data');
  }
  try {
    const framed: JsonLdDocument = await useFrame({
      data: data,
      context: ubbontContext as ContextDefinition,
      type: 'HumanMadeObject',
      id: data.id
    });
    if (!framed) {
      throw new Error('Framing resulted in empty document');
    }
    return framed;
  } catch (error) {
    throw new Error(`Error framing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


export const mapItemToLinkedArt = async (data: UbbontItem): Promise<JsonLdDocument> => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Cannot map empty data to LinkedArt');
  }
  try {
    let dto: any = data;
    const DEFAULT_MODIFIED_DATE = "2020-01-01T00:00:00";

    // CLEANUP SECTION
    // We assume all @none language tags are really norwegian
    dto = JSON.parse(JSON.stringify(dto).replaceAll('"@none":', '"no":').replaceAll('"none":', '"no":'));
    // Removes non-object items from the specified properties of the input dto array.
    dto = removeStringsFromArray(dto);

    // Remove the inline context and add the url to the context
    dto['@context'] = [`${env.API_BASE_URL}/ns/ubbont/context.json`];
    // Add provenance as a string, since some are strings and some are objects
    dto.provenance = typeof dto.provenance === 'string' ? dto.provenance : dto.provenance?._label ?? undefined;
    // License is an object, but we only need the label.no
    dto.license = dto.license?._label?.no[0] ?? undefined;

    // @TODO: Remove this when we have dct:modified on all items in the dataset
    dto._modified = dto._modified ?? DEFAULT_MODIFIED_DATE;

    dto = omitEmptyEs(dto);

    const base: TBaseMetadata = {
      identifier: dto.identifier,
      context: ['https://linked.art/ns/v1/linked-art.json', 'https://api.ub.uib.no/ns/ubbont/context.json'],
      newId: `${dto.uuid ?? dto.identifier}`,
      originalId: dto.id,
      productionTimeSpan: getTimeSpan(dto.created, dto.madeAfter, dto.madeBefore),
      _label: dto._label,
    };

    // Construct LinkedArt
    dto = constructCoreMetadata(base, dto);
    dto = constructIdentifiers(dto);
    dto = constructProduction(dto);
    dto = constructCollection(dto);
    dto = constructDigitalIntegration(dto);
    dto = await constructAboutness(dto);
    dto = constructDimension(dto);
    dto = constructAssertions(base, dto);
    dto = constructOwnership(base, dto);
    dto = constructCorrespondance(dto);
    dto = await constructSubjectTo(base, dto);

    const parsed = ZodHumanMadeObjectSchema.safeParse(dto);
    if (parsed.success === false) {
      console.log(base.identifier);
      console.log(parsed.error.issues);
      await observeClient.index({
        index: 'logs-chc',
        body: {
          '@timestamp': new Date(),
          message: `id: ${base.identifier}, issues: ${JSON.stringify(parsed.error.issues)}`
        }
      });
      // You might want to throw an error here depending on your requirements
      // throw new Error(`Validation failed for item ${base.identifier}`);
    }
    return dto;
  } catch (error) {
    throw new Error(`Error mapping item to LinkedArt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const fetchAndProcessItem = async (id: string): Promise<JsonLdDocument | null> => {
  try {
    const item = await fetchItem(id);
    const framed = await frameItem(item);
    const linkedArt = await mapItemToLinkedArt(framed);
    return linkedArt;
  } catch (error) {
    // Log the error
    console.error(`Error processing item ${id}:`, error);
    await observeClient.index({
      index: 'logs-chc',
      body: {
        '@timestamp': new Date(),
        message: `Error processing item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
    // Return null instead of throwing, or throw depending on your requirements
    return null;
  }
}