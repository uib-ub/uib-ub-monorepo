import { removeStringsFromArray } from '@helpers/cleaners/removeStringsFromArray'
import { constructCoreMetadata } from '@helpers/mappers/la/group/constructCoreMetadata'
import { constructLifetimeTimeSpan } from '@helpers/mappers/la/person/constructLifetimeTimeSpan'
import { constructAboutness } from '@helpers/mappers/la/shared/constructAboutness'
import { constructAssertions } from '@helpers/mappers/la/shared/constructAssertions'
import { constructDigitalIntegration } from '@helpers/mappers/la/shared/constructDigitalIntegration'
import { constructHal } from '@helpers/mappers/la/shared/constructHal'
import { constructIdentifiers } from '@helpers/mappers/la/shared/constructIdentifiers'
import { constructSubjectTo } from '@helpers/mappers/la/shared/constructSubjectTo'
import { TBaseMetadata } from '@models'
import { env } from 'bun'

export const toLinkedArtPersonTransformer = async (data: any, context: string) => {
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
    newId: `${env.API_URL}/groups/${data.uuid ?? data.identifier}`,
    originalId: data.id,
    _label: data._label,
  }

  // Construct LinkedArt
  data = constructCoreMetadata(base, data)
  data = constructIdentifiers(data)
  data = constructLifetimeTimeSpan(data)
  data = constructDigitalIntegration(data)
  data = await constructAboutness(data)
  data = constructAssertions(data)
  data = await constructSubjectTo(base, data)
  data = constructHal(data)

  return data
}