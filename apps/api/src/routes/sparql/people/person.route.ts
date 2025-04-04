import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { AsParamsSchema, LegacyPersonSchema, TODO } from '@models'
import { personOrGroupSparqlQuery } from '@services/sparql/queries'
import { ItemTransformer } from '@routes/sparql/items/item.transformer'
import { toLinkedArtPersonTransformer } from '@transformers/person.transformer'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodPersonSchema } from 'types'
import { ZodSchema } from 'zod'

const route = new OpenAPIHono()

const PersonSchema = z.record(z.string()).openapi('Person')

export const getItem = createRoute({
  method: 'get',
  path: '/people/{source}/{id}',
  request: {
    params: LegacyPersonSchema,
    query: AsParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a person.',
    },
  },
  description: 'Retrieve a person.',
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
      transformer = toLinkedArtPersonTransformer
      schema = ZodPersonSchema as any
      break;
    case 'ubbont':
      transformer = ItemTransformer.toUbbont
      break;
    default:
      throw new HTTPException(400, { message: 'Invalid value for "as" parameter' });
  }

  try {
    const query = sqb(personOrGroupSparqlQuery, { id, class: 'foaf:Person' })
    const data: TODO = await executeQuery(query, SERVICE_URL)
    // We clean up the data before compacting and framing
    const fixedDates = cleanDateDatatypes(data)
    const withFloats = convertToFloat(fixedDates)

    const framed: JsonLdDocument = await useFrame({ data: withFloats, context: context, type: 'Person', id: withFloats.id })
    const response = await transformer(framed, contextString)

    if (schema) {
      const parsed = schema.safeParse(response);
      if (parsed.success === false) {
        console.log(parsed.error.issues)
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
