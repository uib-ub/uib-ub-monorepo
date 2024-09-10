import { constructIIIFStructure } from '@helpers/mappers/iiif/constructIIIFStructure'

export const toManifestTransformer = async (data: any) => {
  return constructIIIFStructure(data)
}