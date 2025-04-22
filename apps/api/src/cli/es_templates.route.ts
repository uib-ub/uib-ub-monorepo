import client from '@shared/clients/es-client'
import { logLifecyclePolicies } from '@shared/config/elasticsearch/lifecycle-policies'
import { chcDataFieldTemplateComponent, chcIdTemplateComponent, chcLabelTemplateComponent, chcOwnersTemplateComponent, chcProductionTemplateComponent, chcSourceSettings } from '@shared/config/elasticsearch/mappings/chc'
import { logMappings } from '@shared/config/elasticsearch/mappings/log'
import { logSettings } from '@shared/config/elasticsearch/settings/log'
import { chcTemplate, logTemplate, manifestsTemplate } from '@shared/lib/indexers/templates'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { esFailureSchema, esPutSettingsSuccessSchema } from '@shared/models'
import { TypedResponse } from 'hono'
import { HTTPException } from 'hono/http-exception'

const route = new OpenAPIHono()

const putTemplatesSuccess = z.array(z.union([esPutSettingsSuccessSchema, esFailureSchema]))

export const putTemplates = createRoute({
  method: 'put',
  path: '/es/update-templates',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: putTemplatesSuccess,
        },
      },
      description: '',
    },
  },
  description: '',
  tags: ['Ingest'],
})

route.openapi(
  putTemplates,
  async (c): Promise<TypedResponse<({ status?: string; value?: { acknowledged?: boolean; } } | { error?: string })[], 200, "json">> => {
    try {
      const promises = [
        client.ilm.putLifecycle(logLifecyclePolicies),
        client.cluster.putComponentTemplate(logSettings),
        client.cluster.putComponentTemplate(logMappings),
        client.cluster.putComponentTemplate(chcSourceSettings),
        client.cluster.putComponentTemplate(chcIdTemplateComponent),
        client.cluster.putComponentTemplate(chcDataFieldTemplateComponent),
        client.cluster.putComponentTemplate(chcLabelTemplateComponent),
        client.cluster.putComponentTemplate(chcOwnersTemplateComponent),
        client.cluster.putComponentTemplate(chcProductionTemplateComponent),
        client.indices.putIndexTemplate(manifestsTemplate),
        client.indices.putIndexTemplate(logTemplate),
        client.indices.putIndexTemplate(chcTemplate),
      ]
      const response = await Promise.allSettled(promises)
      return c.json(response as ({ status?: string; value?: { acknowledged?: boolean; } } | { error?: string })[])
    } catch (error) {
      console.error(error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
  },
);

export default route