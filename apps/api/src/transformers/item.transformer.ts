import { removeStringsFromArray } from '@helpers/cleaners/removeStringsFromArray';
import { constructManifest } from '@helpers/mappers/constructManifest';
import { constructCollection } from '@helpers/mappers/la/object/constructCollection';
import { constructCoreMetadata } from '@helpers/mappers/la/object/constructCoreMetadata';
import { constructCorrespondance } from '@helpers/mappers/la/object/constructCorrespondance';
import { constructDimension } from '@helpers/mappers/la/object/constructDimension';
import { constructOwnership } from '@helpers/mappers/la/object/constructOwnership';
import { constructProduction } from '@helpers/mappers/la/object/constructProduction';
import { constructProvenance } from '@helpers/mappers/la/object/constructProvenance';
import { constructAboutness } from '@helpers/mappers/la/shared/constructAboutness';
import { constructAssertions } from '@helpers/mappers/la/shared/constructAssertions';
import { constructDigitalIntegration } from '@helpers/mappers/la/shared/constructDigitalIntegration';
import { constructIdentifiers } from '@helpers/mappers/la/shared/constructIdentifiers';
import { constructSubjectTo } from '@helpers/mappers/la/shared/constructSubjectTo';
import { getTimeSpan } from '@helpers/mappers/la/shared/constructTimeSpan';
import { TBaseMetadata } from '@models';
import { env } from 'bun';
import omitEmptyEs from 'omit-empty-es';
import type { CrmE22_HumanMade_Object } from 'types/src/la/types/linked_art';

export const toUbbontTransformer = async (data: any, context: string) => {
  let dto = data

  // We assume all @none language tags are really norwegian
  dto = JSON.parse(JSON.stringify(dto).replaceAll('"@none":', '"no":').replaceAll('"none":', '"no":'))
  // Removes non-object items from the specified properties of the input dto array.
  dto = removeStringsFromArray(dto)

  // Remove the inline context and add the url to the context
  dto['@context'] = context
  // Add provenance as a string. @TODO: Remove this when we have dct:provenance on all items in the dtoset
  dto.provenance = typeof dto.provenance === 'string' ? dto.provenance : dto.provenance?._label ?? undefined
  // License is an object, but we only need the label.no
  dto.license = dto.license?._label?.no[0] ?? undefined

  // @TODO: Remove this when we have dct:modified on all items in the dtoset
  dto._modified = dto._modified ?? "2020-01-01T00:00:00"

  return dto
}

export const toLinkedArtItemTransformer = async (data: any, context: string): Promise<CrmE22_HumanMade_Object> => {
  let dto = data

  // We assume all @none language tags are really norwegian
  dto = JSON.parse(JSON.stringify(dto).replaceAll('"@none":', '"no":').replaceAll('"none":', '"no":'))
  // Removes non-object items from the specified properties of the input dto array.
  dto = removeStringsFromArray(dto)
  // TODO: we  do this all over the place, is it efficient?
  dto = omitEmptyEs(dto)

  // Remove the inline context and add the url to the context
  dto['@context'] = context
  // Add provenance as a string. @TODO: Remove this when we have dct:provenance on all items in the dtoset
  dto.provenance = typeof dto.provenance === 'string' ? dto.provenance : dto.provenance?._label ?? undefined
  // License is an object, but we only need the label.no
  dto.license = dto.license?._label?.no[0] ?? undefined

  // @TODO: Remove this when we have dct:modified on all items in the dtoset
  dto._modified = dto._modified ?? "2020-01-01T00:00:00"


  // We might not get a label for the object, but we need to have a label for the object. So we add a placeholder label.
  if (!dto._label) {
    dto._label = {
      no: ["Uten tittel"],
      en: ["Untitled"]
    }
  }

  const base: TBaseMetadata = {
    identifier: dto.identifier,
    context: ['https://linked.art/ns/v1/linked-art.json', 'https://api.ub.uib.no/ns/ubbont/context.json'],
    newId: `${env.API_URL}/items/${dto.uuid ?? dto.identifier}`,
    originalId: dto.id,
    productionTimeSpan: getTimeSpan(dto.created, dto.madeAfter, dto.madeBefore),
    _label: dto._label,
  }

  // Construct LinkedArt
  dto = constructCoreMetadata(base, dto)
  dto = constructIdentifiers(dto)
  dto = constructProduction(dto)
  dto = constructProvenance(dto)
  dto = constructCollection(dto)
  dto = constructDigitalIntegration(dto)
  dto = await constructAboutness(dto)
  dto = constructDimension(dto)
  dto = constructAssertions(dto)
  dto = constructOwnership(base, dto)
  dto = constructCorrespondance(dto)
  dto = await constructSubjectTo(base, dto)

  return dto
}

export const toIIIFPresentationTransformer = async (data: any, source: string) => {
  return constructManifest(data, env.API_URL, source)
} 