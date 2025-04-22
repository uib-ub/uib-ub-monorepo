import { constructIIIFStructure } from '@shared/lib/mappers/iiif/constructIIIFStructure'

export const toManifestTransformer = async (data: any, fileset: any) => {
  return constructIIIFStructure(data, fileset)
}