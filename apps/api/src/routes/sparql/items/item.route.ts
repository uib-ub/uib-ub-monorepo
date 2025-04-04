import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { ItemParamsSchema, LegacyItemSchema } from '@models'
import { ZodHumanMadeObjectSchema } from 'types'
import { FormatType, getItem as getItemService } from './item.service'
import { HTTPException } from 'hono/http-exception'

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
    400: {
      description: 'Invalid request parameters or format',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    }
  },
  description: 'Retrieve a item. This is a physical or born-digital item in the library collection.',
  tags: ['Sparql', 'Items'],
})

route.openapi(getItem, async (c) => {
  try {
    const { id, source } = c.req.param()
    const { as = 'la' } = c.req.query()

    const response = await getItemService(id, source, as as FormatType)
    return c.json(response)
  } catch (error) {
    console.error('Error in getItem route:', error)

    if (error instanceof HTTPException) {
      throw error
    }

    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route