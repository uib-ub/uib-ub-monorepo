import { constructIIIFStructure } from '@shared/mappers/iiif/constructIIIFStructure'

export const toManifestTransformer = async (data: any, fileset: any) => {
  return constructIIIFStructure(data, fileset)
}