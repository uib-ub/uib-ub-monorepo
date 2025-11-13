import { endpointUrl } from '@/clients/sparql-chc-client';
import { SPARQL_PREFIXES } from '../../constants';
import { JsonLdDocument, ContextDefinition } from 'jsonld';
import ubbontContext from 'jsonld-contexts/src/ubbontContext';
import { normalizeJsonLdToArray, sqb, useFrame } from 'utils';
import { observeClient } from '@/clients/es-client';
import { ZodPersonSchema } from 'types';
import { constructDigitalIntegration } from '../mappers/la/shared/constructDigitalIntegration';
import { constructIdentifiers } from '../mappers/la/shared/constructIdentifiers';
import { constructAboutness } from '../mappers/la/shared/constructAboutness';
import { constructAssertions } from '../mappers/la/shared/constructAssertions';
import { constructSubjectTo } from '../mappers/la/shared/constructSubjectTo';
import { constructCoreMetadata } from '../mappers/la/person/constructCoreMetadata';
import { getTimeSpan } from '../mappers/la/shared/constructTimeSpan';
import { TBaseMetadata } from '../ingest-object/fetch-item';
import { removeStringsFromArray } from '../mappers/la/removeStringsFromArray';
import { env } from '@/env';
import omitEmptyEs from 'omit-empty-es';
import { constructLifetimeTimeSpan } from '../mappers/la/person/constructLifetimeTimeSpan';
import { constructActivities } from '../mappers/la/person/constructActivities';
import { constructMembership } from '../mappers/la/person/constructMembership';

export type UbbontItem = {
  [key: string]: any;
}

const query = `
  ${SPARQL_PREFIXES}
  CONSTRUCT { 
    ?uri a crm:E21_Person ;
      ?p ?o ;
      crm:P2_has_type ?type ;
      rdfs:label ?label ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?oIdentifier ;
      foaf:gender ?oGender ;
      rdfs:label ?oLabel ;
      ubbont:hasURI ?hasURI .
  } WHERE { 
    VALUES ?id {"%id"}
    VALUES ?types { foaf:Person ubbont:Cataloguer }
    ?uri dct:identifier ?id ;
      rdf:type ?types ;
      ?p ?o ;
      a ?class .
    OPTIONAL {?uri dct:title ?title } .
    OPTIONAL {?uri foaf:name ?name } .
    OPTIONAL {?uri skos:prefLabel ?prefLabel } .
    OPTIONAL {?uri rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .  
    OPTIONAL { 
      ?o a ?oClass ;
      dct:identifier ?oIdentifier ;
      OPTIONAL { ?o foaf:gender ?oGender } .
      OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
      OPTIONAL { ?o ubbont:hasURI ?hasURI } .
      FILTER(?oClass != rdfs:Class) .
    }
    FILTER(STRENDS(STR(?uri), ?id)) .
    FILTER(?o != ?uri) .
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type) .
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage) .
    FILTER(?p NOT IN (rdf:type, foaf:made, ubbont:reproduced, ubbont:isRightsHolderOf, schema:email,owl:versionInfo, dct:hasPart, ubbont:editorOf, ubbont:ownedBy, ubbont:catalogued, ubbont:cataloguer, ubbont:commissioned, ubbont:originalCreatorOf, ubbont:formerOwnerOf, ubbont:internalNote, ubbont:hasThumbnail, dct:relation, dc:relation, skos:related, dct:isReferencedBy, skos:inScheme, ubbont:published))
  }
`

export const fetchPerson = async (id: string): Promise<UbbontItem> => {
  try {
    const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { id }))}&output=json`);
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


export const framePerson = async (data: UbbontItem, id: string): Promise<JsonLdDocument> => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Cannot frame empty data');
  }

  // Find the matching item in the graph
  const matchingItem = (data['@graph'] ?? [data]).find((item: any) => item['dct:identifier'] === id);
  if (!matchingItem) {
    throw new Error('Person not found in graph');
  }

  const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

  try {
    const framed: JsonLdDocument = await useFrame({
      data: data,
      context: ubbontContext as ContextDefinition,
      type: 'Person',
      id: url
    });
    if (!framed) {
      throw new Error('Framing resulted in empty document');
    }
    return framed;
  } catch (error) {
    throw new Error(`Error framing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const mapPersonToLinkedArt = async (data: UbbontItem): Promise<JsonLdDocument> => {
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

    dto._modified = Array.isArray(dto._modified) ? dto._modified.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())[0] : dto._modified ?? DEFAULT_MODIFIED_DATE;
    // @TODO: Remove this when we have dct:modified on all items in the dataset
    dto._modified = dto._modified ?? DEFAULT_MODIFIED_DATE;
    // _available can be an array of dates, we need to pick the "oldest one"
    dto._available = Array.isArray(dto._available) ? dto._available.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())[0] : dto._available ?? DEFAULT_MODIFIED_DATE;
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
    dto = constructLifetimeTimeSpan(dto);
    dto = constructMembership(dto);
    dto = constructActivities(base, dto);
    dto = constructDigitalIntegration(dto);
    dto = await constructAboutness(dto);
    dto = constructAssertions(base, dto);
    dto = await constructSubjectTo(base, dto);

    const parsed = ZodPersonSchema.safeParse(dto);
    if (parsed.success === false) {
      console.log(base.identifier);
      //console.log(dto);
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

export const fetchAndProcessPerson = async (id: string): Promise<JsonLdDocument | null> => {
  try {
    const person = await fetchPerson(id);
    const framed = await framePerson(person, id);
    const linkedArt = await mapPersonToLinkedArt(framed);
    return linkedArt;
  } catch (error) {
    // Log the error
    console.error(`Error processing person ${id}:`, error);
    await observeClient.index({
      index: 'logs-chc',
      body: {
        '@timestamp': new Date(),
        message: `Error processing person ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
    // Return null instead of throwing, or throw depending on your requirements
    return null;
  }
}