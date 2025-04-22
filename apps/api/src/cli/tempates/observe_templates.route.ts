import { observeClient } from '@shared/clients/es-client'
import { logLifecyclePolicies } from '@shared/lib/indexers/lifecycle-policies'
import { logMappings } from '@shared/lib/indexers/mappings/log'
import { logSettings } from '@shared/lib/indexers/settings/log'
import { logTemplate } from '@shared/lib/indexers/templates'
import { z } from '@hono/zod-openapi'
import { esFailureSchema, esPutSettingsSuccessSchema } from '@shared/models'


const ESResponse = z.array(z.union([esPutSettingsSuccessSchema, esFailureSchema]))
type ESResponse = z.infer<typeof ESResponse>

export const putTemplates = async (): Promise<ESResponse> => {
  try {
    const promises = [
      observeClient.ilm.putLifecycle(logLifecyclePolicies),
      observeClient.cluster.putComponentTemplate(logSettings),
      observeClient.cluster.putComponentTemplate(logMappings),
      observeClient.indices.putIndexTemplate(logTemplate),
    ]
    const response = await Promise.allSettled(promises)
    return response
  } catch (error) {
    console.error(error);
  }
}