import { ESResponse } from './types'
import { observeClient } from '../../clients/es-client'
import { logLifecyclePolicies } from '../indexers/lifecycle-policies'
import { logMappings } from '../indexers/mappings/log'
import { logSettings } from '../indexers/settings/log'
import { logTemplate } from '../indexers/templates'


export const putTemplates = async (): Promise<ESResponse> => {
  try {
    const promises = [
      observeClient.ilm.putLifecycle(logLifecyclePolicies),
      observeClient.cluster.putComponentTemplate(logSettings),
      observeClient.cluster.putComponentTemplate(logMappings),
      observeClient.indices.putIndexTemplate(logTemplate),
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