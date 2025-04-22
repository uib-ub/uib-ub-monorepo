import client from '@shared/clients/es-client'
import { chcDataFieldTemplateComponent, chcIdTemplateComponent, chcLabelTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from '@shared/lib/indexers/mappings/chc'
import { chcTemplate, manifestsTemplate } from '@shared/lib/indexers/templates'
import { z } from '@hono/zod-openapi'
import { esFailureSchema, esPutSettingsSuccessSchema } from '@shared/models'

const ESResponse = z.array(z.union([esPutSettingsSuccessSchema, esFailureSchema]))
type ESResponse = z.infer<typeof ESResponse>

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
    return response
  } catch (error) {
    console.error(error);
  }
}