import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { AsParamsSchema, LegacyGroupSchema, TODO } from '@models'
import { personOrGroupSparqlQuery } from '@services/sparql/queries'
import { toLinkedArtGroupTransformer } from '@transformers/group.transformer'
import { toUbbontTransformer } from '@transformers/item.transformer'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodGroupSchema } from 'types'
import { ZodSchema } from 'zod'

const route = new OpenAPIHono()

const GroupsSchema = z.record(z.string(), z.any()).openapi('Groups')

export const getItem = createRoute({
  method: 'get',
  path: '/groups/{source}/{id}',
  request: {
    params: LegacyGroupSchema,
    query: AsParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ZodGroupSchema.openapi('Group', { type: 'object' })
        },
      },
      description: 'Retrieve a group.',
    },
  },
  description: 'Retrieve a group.',
  tags: ['Sparql'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url

  let transformer: Function
  let schema: ZodSchema
  let context = ubbontContext as ContextDefinition
  let contextString = `${env.API_URL}/ns/ubbont/context.json`

  switch (as) {
    case 'la':
      transformer = toLinkedArtGroupTransformer
      schema = ZodGroupSchema
      break;
    case 'ubbont':
      transformer = toUbbontTransformer
      break;
    default:
      throw new HTTPException(400, { message: 'Invalid value for "as" parameter' });
  }

  try {
    const query = sqb(personOrGroupSparqlQuery, { id, class: 'crm:E74_Group' })
    const response: TODO = await executeQuery(query, SERVICE_URL)
    // We clean up the data before compacting and framing
    const fixedDates = cleanDateDatatypes(response)
    const withFloats = convertToFloat(fixedDates)

    const framed: JsonLdDocument = await useFrame({ data: withFloats, context: context, type: 'Group', id: withFloats.id })
    const data = await transformer(framed, contextString)

    if (schema) {
      const parsed = schema.safeParse(data);
      if (parsed.success === false) {
        console.log(parsed.error.issues)
      }
    }

    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route