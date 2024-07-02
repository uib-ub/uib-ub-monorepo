import client, { observeClient } from '@config/apis/esClient'
import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import getItemData from '@services/sparql/marcus/item.service'
import { toLinkedArtItemTransformer } from '@transformers/item.transformer'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodHumanMadeObjectSchema } from 'types'

const route = new Hono()

route.get('/ingest/:id',
  async (c) => {
    const { id } = c.req.param()
    const { index } = c.req.query()

    const SERVICE_URL = DATA_SOURCES.filter(service => service.name === 'marcus')[0].url
    const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`


    try {
      const data = await getItemData(id, SERVICE_URL)
      // We clean up the data before compacting and framing
      const fixedDates = cleanDateDatatypes(data)
      const withFloats = convertToFloat(fixedDates)

      const framed: JsonLdDocument = await useFrame({ data: withFloats, context: ubbontContext as ContextDefinition, type: 'HumanMadeObject', id: withFloats.id })
      const response = await toLinkedArtItemTransformer(framed, CONTEXT)

      const parsed = ZodHumanMadeObjectSchema.safeParse(response);
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

      try {
        client.index({
          id: id,
          index: index,
          document: response,
          pipeline: 'chc-pipeline'
        })
        return c.json({ status: 'ok', message: `Indexed ${id}` });
      } catch (err) {
        console.log(err)
      }

    } catch (error) {
      // Handle the error here
      console.error(error);
      throw new HTTPException(500, { message: 'Internal Server Error' })
    }

  })

export default route