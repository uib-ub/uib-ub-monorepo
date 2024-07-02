import { observeClient } from '@config/apis/esClient'
import { logLifecyclePolicies } from '@config/elasticsearch/lifecycle-policies'
import { logMappings } from '@config/elasticsearch/mappings/log'
import { logSettings } from '@config/elasticsearch/settings/log'
import { logTemplate } from '@config/elasticsearch/templates'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { esFailureSchema, esPutSettingsSuccessSchema } from '@models'
import { TypedResponse } from 'hono'
import { HTTPException } from 'hono/http-exception'

const route = new OpenAPIHono()

const putTemplatesSuccess = z.array(z.union([esPutSettingsSuccessSchema, esFailureSchema]))

export const putTemplates = createRoute({
  method: 'put',
  path: '/observe/update-templates',
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
        observeClient.ilm.putLifecycle(logLifecyclePolicies),
        observeClient.cluster.putComponentTemplate(logSettings),
        observeClient.cluster.putComponentTemplate(logMappings),
        observeClient.indices.putIndexTemplate(logTemplate),
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