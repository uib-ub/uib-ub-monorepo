import { removeStringsFromArray } from '@helpers/cleaners/removeStringsFromArray';
import { constructIIIFStructure } from '@helpers/mappers/iiif/constructIIIFStructure';
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
import omitEmptyEs from 'omit-empty-es';
import { env } from '@config/env';
import type { CrmE22_HumanMade_Object } from 'types/src/la/types/linked_art';
import { ZodHumanMadeObjectSchema } from 'types';
import { observeClient } from '@config/apis/esClient';

const DEFAULT_MODIFIED_DATE = "2020-01-01T00:00:00";

export class ItemTransformer {
  static async toUbbont(data: any, context: string) {
    let dto = ItemTransformer.prepareBaseData(data, context);
    return dto;
  }

  static async toLinkedArt(data: any, context: string): Promise<CrmE22_HumanMade_Object> {
    let dto = ItemTransformer.prepareBaseData(data, context);

    dto = omitEmptyEs(dto);


    const base: TBaseMetadata = {
      identifier: dto.identifier,
      context: ['https://linked.art/ns/v1/linked-art.json', 'https://api.ub.uib.no/ns/ubbont/context.json'],
      newId: `${env.API_URL}/items/${dto.uuid ?? dto.identifier}`,
      originalId: dto.id,
      productionTimeSpan: getTimeSpan(dto.created, dto.madeAfter, dto.madeBefore),
      _label: dto._label,
    };

    // Construct LinkedArt
    dto = constructCoreMetadata(base, dto);
    dto = constructIdentifiers(dto);
    dto = constructProduction(dto);
    dto = constructProvenance(dto);
    dto = constructCollection(dto);
    dto = constructDigitalIntegration(dto);
    dto = await constructAboutness(dto);
    dto = constructDimension(dto);
    dto = constructAssertions(dto);
    dto = constructOwnership(base, dto);
    dto = constructCorrespondance(dto);
    dto = await constructSubjectTo(base, dto);

    const parsed = ZodHumanMadeObjectSchema.safeParse(dto);
    if (parsed.success === false) {
      console.log(parsed.error.issues)
      observeClient.index({
        index: 'logs-chc',
        body: {
          '@timestamp': new Date(),
          message: `id: ${base.identifier}, issues: ${JSON.stringify(parsed.error.issues)}`
        }
      })
    }
    return dto;
  }

  static toIIIF(data: any, fileset: any) {
    return constructIIIFStructure(data, fileset);
  }

  private static prepareBaseData(data: any, context: string): any {
    let dto = data;

    // We assume all @none language tags are really norwegian
    dto = JSON.parse(JSON.stringify(dto).replaceAll('"@none":', '"no":').replaceAll('"none":', '"no":'));
    // Removes non-object items from the specified properties of the input dto array.
    dto = removeStringsFromArray(dto);

    // Remove the inline context and add the url to the context
    dto['@context'] = context;
    // Add provenance as a string. @TODO: Remove this when we have dct:provenance on all items in the dataset
    dto.provenance = typeof dto.provenance === 'string' ? dto.provenance : dto.provenance?._label ?? undefined;
    // License is an object, but we only need the label.no
    dto.license = dto.license?._label?.no[0] ?? undefined;

    // @TODO: Remove this when we have dct:modified on all items in the dataset
    dto._modified = dto._modified ?? DEFAULT_MODIFIED_DATE;

    return dto;
  }
}
