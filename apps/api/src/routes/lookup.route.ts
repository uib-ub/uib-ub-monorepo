import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { IdParamsSchema } from '@shared/models'
import { DATA_SOURCES } from '@shared/constants'
//import { default as fetch } from '@helpers/fetchRetry'

/**
 * Lookup schema
 * Stupid attempt to isolate the API from the source of the data. With sparql
 * you can use the same query to ASK if the id exists, but for rest you need to know
 * id there is an "exists" endpoint. If not to use some custom logic to check if the
 * id exists and supply the correst API endpoint to get metadata on the object.
 * Then you need to decide what data you want to return.
 */
const LookupSchema = z.object({
  'name': z.string().openapi({
    example: 'ska',
  }),
  'lookupUrl': z.string().optional().openapi({
    example: 'https://sparql.ub.uib.no/skeivtarkiv/query?query=',
  }),
  'url': z.string().openapi({
    example: 'https://sparql.ub.uib.no/skeivtarkiv/query?query=',
  }),
  'type': z.string().openapi({
    example: 'sparql|rest',
  })
}).openapi('Lookup')

const app = new OpenAPIHono()

export const resolveId = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LookupSchema,
        },
      },
      description: 'Service name, url and type this ID is available at.',
    },
  },
  description: 'Lookup ID and find service url and type this objects is available at.',
  tags: ['Lookup'],
})

app.openapi(resolveId, async (c) => {
  const id = c.req.param('id')
  const data = await lookupService(id)
  return c.json(data)
})


export async function lookupService(id: string) {
  const sparqlAskQuery = `
    PREFIX dct: <http://purl.org/dc/terms/>
    ASK { 
      { 
        VALUES ?id { "${id}" }
        ?s dct:identifier ?id .
      }
      UNION
      {
        ?s dct:identifier ?id .
        FILTER langMatches( lang(?id), "no" ) 
      }
      UNION
      {
        ?s dct:identifier ?id .
        FILTER langMatches( lang(?id), "en" ) 
      }
    }      
  `
  /**
   * @todo
   * This is a Goobi query that looks for the id. 
   * Currently the real id is not used, as this has not 
   * been added to the SOLR index.
   */
  const goobiQuery = `{
    "query": "+PI_PARENT:${id}",
    "resultFields": [
      "*",
      "IDDOC",
      "DOCTYPE",
      "DOCSTRCT",
      "LABEL"
    ],
    "sortFields": [],
    "sortOrder": "asc",
    "jsonFormat": "recordcentric",
    "count": 10,
    "offset": 0,
    "randomize": false,
    "language": "en",
    "includeChildHits": false,
    "boostTopLevelDocstructs": false,
    "facetFields": []
  }`

  const sparqlPromises = DATA_SOURCES.filter(s => s.type === 'sparql').map(async (service: any) => {
    return fetch(`${service.url}${encodeURIComponent(sparqlAskQuery)}&output=json`).then(res => res.json()).then(res => {
      if (res.boolean) {
        return service
      }
    })
  })

  const goobiPromise = DATA_SOURCES.filter(s => s.name === 'samla').map(async (service: any) => {
    return fetch(`${service.lookupUrl || service.url}`, {
      method: 'POST',
      body: goobiQuery,
      headers: { "content-type": "application/json" }
    }).then(res => res.json()).then(res => {
      if (res.numFound) {
        return service
      }
    })
  })


  try {
    const data = await Promise.all([...sparqlPromises, ...goobiPromise]).then((values) => {
      return values.filter(Boolean)[0]
    })
    if (data) {
      return data
    }
    return {
      ok: false,
      message: `No match in any service`
    }
  } catch (error) {
    console.log(error)
  }
}

export default app