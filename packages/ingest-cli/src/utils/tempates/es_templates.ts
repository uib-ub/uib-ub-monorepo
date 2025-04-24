import client from '../../clients/es-client'
import { chcDataFieldTemplateComponent, chcIdTemplateComponent, chcLabelTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from '../indexers/mappings/chc'
import { chcTemplate, manifestsTemplate } from '../indexers/templates'
import { ESResponse } from './types'

export const putTemplates = async (): Promise<ESResponse> => {
  try {
    const promises = [
      client.cluster.putComponentTemplate(chcSourceSettings),
      client.cluster.putComponentTemplate(chcIdTemplateComponent),
      client.cluster.putComponentTemplate(chcDataFieldTemplateComponent),
      client.cluster.putComponentTemplate(chcLabelTemplateComponent),
      client.cluster.putComponentTemplate(chcOwnersTemplateComponent),
      client.cluster.putComponentTemplate(chcProductionTemplateComponent),
      client.indices.putIndexTemplate(manifestsTemplate),
      client.indices.putIndexTemplate(chcTemplate),
    ]
    const response = await Promise.allSettled(promises)
    return response.map(result =>
      result.status === 'fulfilled'
        ? { status: 'fulfilled', value: result.value }
        : { error: String(result.reason) }
    ) as ESResponse
  } catch (error) {
    console.error(error);
    return [{ error: String(error) }];
  }
}