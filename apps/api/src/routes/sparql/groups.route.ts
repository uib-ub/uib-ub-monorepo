import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { AsParamsSchema, LegacyGroupSchema, PaginationParamsSchema, SourceParamsSchema, TODO } from '@models'
import { countGroups } from '@services/sparql/marcus/count_groups.service'
import { getGroups } from '@services/sparql/marcus/groups.service'
import getGroupData from '@services/sparql/marcus/group_la.service'
import getItemUbbontData from '@services/sparql/marcus/item_ubbont.service'
import { HTTPException } from 'hono/http-exception'

const route = new OpenAPIHono()

const GroupsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/organization/0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
    'identifier': z.string().openapi({
      example: '0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
  })
).openapi('Groups')

const PersonSchema = z.record(z.string()).openapi('Item')
const CountSchema = z.record(z.number()).openapi('Item')

export const countGroupsRoute = createRoute({
  method: 'get',
  path: '/groups/{source}/count',
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
      description: 'Returns the number of groups in the dataset.',
    },
  },
  description: 'Returns the number of groups in the dataset. These are groups connected to material in the library collection.',
  tags: ['sparql'],
})

route.openapi(countGroupsRoute, async (c) => {
  const source = c.req.param('source')
  const data = await countGroups(source)
  return c.json(data)
})

export const getList = createRoute({
  method: 'get',
  path: '/groups/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GroupsSchema,
        },
      },
      description: 'Retrieve a list of groups.',
    },
  },
  description: 'Retrieve a list of groups.',
  tags: ['sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const data = await getGroups(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})

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
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a group.',
    },
  },
  description: 'Retrieve a groups.',
  tags: ['sparql'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const fetcher = as === 'la' ? getGroupData : getItemUbbontData

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'Group')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route