import { endpointUrl } from '@/clients/sparql-chc-client';
import { SPARQL_PREFIXES } from '../../constants';
import { JsonLdDocument, ContextDefinition } from 'jsonld';
import ubbontContext from 'jsonld-contexts/src/ubbontContext';
import { sqb, useFrame } from 'utils';
import { observeClient } from '@/clients/es-client';
import { ZodGroupSchema } from 'types';
import { constructDigitalIntegration } from '../mappers/la/shared/constructDigitalIntegration';
import { constructIdentifiers } from '../mappers/la/shared/constructIdentifiers';
import { constructAboutness } from '../mappers/la/shared/constructAboutness';
import { constructAssertions } from '../mappers/la/shared/constructAssertions';
import { constructSubjectTo } from '../mappers/la/shared/constructSubjectTo';
import { constructCoreMetadata } from '../mappers/la/group/constructCoreMetadata';
import { getTimeSpan } from '../mappers/la/shared/constructTimeSpan';
import { TBaseMetadata } from '../ingest-items/fetch-item';
import { removeStringsFromArray } from '../mappers/la/removeStringsFromArray';
import { env } from '@/env';
import omitEmptyEs from 'omit-empty-es';
import { constructLifetimeTimeSpan } from '../mappers/la/person/constructLifetimeTimeSpan';
import { constructActivities } from '../mappers/la/person/constructActivities';
import { constructMembership } from '../mappers/la/person/constructMembership';
import { constructGroupTimeSpan } from '../mappers/la/group/constructGroupTimeSpan';
import { constructHierarchy } from '../mappers/la/group/constructHierarchy';

export type UbbontItem = {
  [key: string]: any;
}

const query = `
  ${SPARQL_PREFIXES}
  CONSTRUCT { 
    ?uri a <http://www.cidoc-crm.org/cidoc-crm/E74_Group> ;
      ?p ?o ;
      crm:P2_has_type ?type ;
      rdfs:label ?label ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?oIdentifier ;
      rdfs:label ?oLabel ;
      ubbont:hasURI ?hasURI .
  } WHERE { 
    VALUES ?id {"%id"}
    VALUES ?types { foaf:Organization ubbont:Family dbo:Company }
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
    FILTER(STRENDS(STR(?uri), LCASE(?id))) .
    FILTER(?o != ?uri) .
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type) .
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage) .
    FILTER(?p NOT IN (rdf:type, foaf:made, dct:hasPart, ubbont:receivedFrom, ubbont:cataloguer, org:hasSubOrganization, skos:prefLabel,ubbont:isSubjectOf, dct:isPartOf, org:hasMember, ubbont:formerOwnerOf,  ubbont:originalCreatorOf, ubbont:commissioned, ubbont:ownedBy, skos:broader, ubbont:isRightsHolderOf, skos:narrower, ubbont:reproduced, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail, dct:relation, dc:relation, dct:isReferencedBy, ubbont:hasTranscription, skos:inScheme, ubbont:published))
  }
`

export const fetchGroup = async (id: string): Promise<UbbontItem> => {
  try {
    const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { id }))}&output=json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch group: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`No data found for id: ${id}`);
    }
    return data;
  } catch (error) {
    throw new Error(`Error fetching group ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const frameGroup = async (data: UbbontItem, id: string): Promise<JsonLdDocument> => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Cannot frame empty data');
  }

  // Find the matching item in the graph
  const matchingItem = (data['@graph'] ?? [data]).find((item: any) => item['dct:identifier'] === id);
  if (!matchingItem) {
    throw new Error('Group not found in graph');
  }

  const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

  try {
    const framed: JsonLdDocument = await useFrame({
      data: data,
      context: ubbontContext as ContextDefinition,
      type: 'Group',
      id: url
    });
    if (!framed) {
      throw new Error('Framing resulted in empty document');
    }
    return framed;
  } catch (error) {
    throw new Error(`Error framing group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const mapGroupToLinkedArt = async (data: UbbontItem): Promise<JsonLdDocument> => {
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
    dto['@context'] = [`${env.API_URL}/ns/ubbont/context.json`];

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
    dto = constructGroupTimeSpan(dto);
    dto = constructIdentifiers(dto);
    dto = constructMembership(dto);
    dto = constructHierarchy(dto);
    dto = constructActivities(base, dto);
    dto = constructDigitalIntegration(dto);
    dto = await constructAboutness(dto);
    dto = constructAssertions(base, dto);
    dto = await constructSubjectTo(base, dto);

    const parsed = ZodGroupSchema.safeParse(dto);
    if (parsed.success === false) {
      console.log(base.identifier);
      console.log(dto);
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
    throw new Error(`Error mapping group to LinkedArt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const fetchAndProcessGroup = async (id: string): Promise<JsonLdDocument | null> => {
  try {
    const group = await fetchGroup(id);
    const framed = await frameGroup(group, id);
    const linkedArt = await mapGroupToLinkedArt(framed);
    return linkedArt;
  } catch (error) {
    // Log the error
    console.error(`Error processing group ${id}:`, error);
    await observeClient.index({
      index: 'logs-chc',
      body: {
        '@timestamp': new Date(),
        message: `Error processing group ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
    // Return null instead of throwing, or throw depending on your requirements
    return null;
  }
}