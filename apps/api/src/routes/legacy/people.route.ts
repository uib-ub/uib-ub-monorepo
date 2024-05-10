import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DATA_SOURCES } from '../../config/constants'
import { env } from '../../config/env'
import { AsParamsSchema, LegacyPersonSchema, PaginationParamsSchema, SourceParamsSchema, TODO } from '../../models'
import { countPeople } from '../../services/legacy_count_people.service'
import getItemUbbontData from '../../services/legacy_item_ubbont.service'
import { getPeople } from '../../services/legacy_people.service'
import getPersonData from '../../services/legacy_person_la.service'

const route = new OpenAPIHono()

const PeopleSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/person/110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
    'identifier': z.string().openapi({
      example: '110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
  })
).openapi('People')

const PersonSchema = z.record(z.string()).openapi('People')
const CountSchema = z.record(z.number()).openapi('People')

export const countPeopleRoute = createRoute({
  method: 'get',
  path: '/people/{source}/count',
  request: {
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CountSchema,
        },
      },
      description: 'Returns the number of items in the dataset.',
    },
  },
  description: 'Returns the number of items in the dataset. These are physical or born-digital items in the library collection.',
  tags: ['legacy'],
})

route.openapi(countPeopleRoute, async (c) => {
  const source = c.req.param('source')
  const data = await countPeople(source)
  return c.json(data)
})

export const getList = createRoute({
  method: 'get',
  path: '/people/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PeopleSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of persons.',
  tags: ['legacy'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const data = await getPeople(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})

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
  tags: ['legacy'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const fetcher = as === 'la' ? getPersonData : getItemUbbontData

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'Person')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default route