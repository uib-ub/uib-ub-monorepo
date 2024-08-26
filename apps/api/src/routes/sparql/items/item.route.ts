import { observeClient } from '@config/apis/esClient'
import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { ItemParamsSchema, LegacyItemSchema } from '@models'
import getItemUbbontData from '@services/sparql/marcus/item.service'
import { manifestService } from '@services/sparql/marcus/manifest.service'
import { toIIIFPresentationTransformer, toLinkedArtItemTransformer, toUbbontTransformer } from '@transformers/item.transformer'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import { iiifManifestContext } from 'jsonld-contexts/src/iiifManifest'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodHumanMadeObjectSchema } from 'types'
import { ZodSchema } from 'zod'

const route = new OpenAPIHono()

export const getItem = createRoute({
  method: 'get',
  path: '/items/{source}/{id}',
  request: {
    params: LegacyItemSchema,
    query: ItemParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ZodHumanMadeObjectSchema.openapi('Item', { type: 'object' }),
        },
      },
      description: 'Placeholder for the proper schema.',
    },
  },
  description: 'Retrieve a item. This is a physical or born-digital item in the library collection.',
  tags: ['Sparql', 'Items'],
})

route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()

  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url;

  let fetcher: Function
  let transformer: Function
  let schema: ZodSchema
  let type: string
  let context: ContextDefinition
  let contextString: string

  switch (as) {
    case 'la':
      fetcher = getItemUbbontData;
      transformer = toLinkedArtItemTransformer
      schema = ZodHumanMadeObjectSchema
      type = 'HumanMadeObject'
      context = ubbontContext as ContextDefinition
      contextString = `${env.API_URL}/ns/ubbont/context.json`
      break;
    case 'ubbont':
      fetcher = getItemUbbontData;
      transformer = toUbbontTransformer
      type = 'HumanMadeObject'
      context = ubbontContext as ContextDefinition
      contextString = `${env.API_URL}/ns/ubbont/context.json`
      break;
    case 'iiif':
      fetcher = manifestService;
      transformer = toIIIFPresentationTransformer
      type = 'Manifest'
      context = iiifManifestContext as ContextDefinition
      contextString = `${env.API_URL}/ns/manifest/context.json`
      break;
    default:
      throw new HTTPException(400, { message: 'Invalid value for "as" parameter' });
  }

  try {
    const data = await fetcher(id, SERVICE_URL)
    // We clean up the data before compacting and framing
    const fixedDates = cleanDateDatatypes(data)
    const withFloats = convertToFloat(fixedDates)

    const framed: JsonLdDocument = await useFrame({ data: withFloats, context: context, type: type, id: withFloats.id })
    const response = await transformer(framed, contextString)

    if (schema) {
      const parsed = schema.safeParse(response);
      if (parsed.success === false) {
        console.log(parsed.error.issues)
        observeClient.index({
          index: 'logs-chc',
          body: {
            '@timestamp': new Date(),
            message: `id: ${id}, issues: ${JSON.stringify(parsed.error.issues)}`
          }
        })
      }
    }

    return c.json(response);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route