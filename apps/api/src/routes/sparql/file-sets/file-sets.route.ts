import { DATA_SOURCES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { listFileSetsSparqlQuery } from '@services/sparql/queries'
import { HTTPException } from 'hono/http-exception'
import jsonld, { ContextDefinition } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'

const route = new OpenAPIHono()

const FileSetsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/aggregation/ubb-bros-00001',
    }),
    'identifier': z.string().openapi({
      example: 'ubb-bros-00001',
    }),
  })
).openapi('File sets')

export const getList = createRoute({
  method: 'get',
  path: '/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FileSetsSchema,
        },
      },
      description: 'Retrieve a list of file sets.',
    },
  },
  description: 'Retrieve a list of file sets.',
  tags: ['Sparql', 'File sets'],
})


route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const query = sqb(listFileSetsSparqlQuery, { page: `${pageInt * limitInt}`, limit: `${limitInt}` });

  try {
    const result = await executeQuery(query, SERVICE_URL)
    const data = await jsonld.compact(result, ubbontContext as ContextDefinition)

    return c.json(cleanJsonld(data))

  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route