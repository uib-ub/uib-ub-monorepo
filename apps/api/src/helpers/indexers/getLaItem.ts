import { observeClient } from '@config/apis/esClient'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import getItemData from '@services/sparql/marcus/item.service'
import { toLinkedArtItemTransformer } from '@transformers/item.transformer'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodHumanMadeObjectSchema } from 'types'

export const getLaItem = async (id: string, source: string): Promise<any> => {
  try {
    const data = await getItemData(id, source)
    // We clean up the data before compacting and framing
    const fixedDates = cleanDateDatatypes(data)
    const withFloats = convertToFloat(fixedDates)

    const framed: JsonLdDocument = await useFrame({ data: withFloats, context: ubbontContext as ContextDefinition, type: 'HumanMadeObject', id: withFloats.id })
    delete framed['@context']
    const response = await toLinkedArtItemTransformer(framed, `${env.API_URL}/ns/ubbont/context.json`)

    const parsed = ZodHumanMadeObjectSchema.safeParse(response);
    if (parsed.success === false) {
      console.log(id, parsed.error.issues)
      // @TODO: Add logging to observe
      observeClient.index({
        index: 'logs-chc',
        body: {
          '@timestamp': new Date(),
          message: `id: ${id}, issues: ${JSON.stringify(parsed.error.issues)}`
        }
      })
    }

    return response
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
}