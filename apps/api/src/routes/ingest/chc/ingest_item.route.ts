import client, { observeClient } from '@config/apis/esClient'
import { CHCSEARCHALIAS, DATA_SOURCES, INDICIES } from '@config/constants'
import { env } from '@config/env'
import { cleanDateDatatypes } from '@helpers/cleaners/cleanDateDatatypes'
import { convertToFloat } from '@helpers/cleaners/convertToFloat'
import { useFrame } from '@helpers/useFrame'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { itemSparqlQuery } from '@services/sparql/queries'
import { toLinkedArtItemTransformer } from '@transformers/item.transformer'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ContextDefinition, JsonLdDocument } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ZodHumanMadeObjectSchema } from 'types'

const route = new Hono()

route.get('/items/:id',
  async (c) => {
    const { id } = c.req.param()

    const SERVICE_URL = DATA_SOURCES.filter(service => service.name === 'marcus')[0].url
    const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

    // Finds the current index name in alias and based on the given indicesInAlias object find the latest index.
    const indicesInAlias = await client.indices.getAlias({ name: CHCSEARCHALIAS })
    const currentIndex = Object.keys(indicesInAlias).find(k => k.startsWith(INDICIES.items))

    try {
      const query = sqb(itemSparqlQuery, { id })
      const result = await executeQuery(query, SERVICE_URL)
      // We clean up the data before compacting and framing
      const fixedDates = cleanDateDatatypes(result)
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
        // Search for documents with matching id field
        const searchResult = await client.search({
          index: currentIndex,
          body: {
            query: {
              match: { "id.keyword": id }
            },
            size: 2  // We only need to know if there's more than one
          }
        });

        // Needed to check the number of hits, as the value can be a number or an object. Typescript doesn't like this.
        let numberOfHits = 0
        if (typeof searchResult.hits.total === 'object') {
          numberOfHits = searchResult.hits.total.value
        } else {
          numberOfHits = searchResult.hits.total ?? 0
        }


        if (numberOfHits > 1) {
          // Multiple documents found - this is an error condition
          console.error(`Multiple documents found with id ${id}`);
          throw new HTTPException(409, { message: `Data integrity error: Multiple documents found with id ${id}` });
        }

        let operation = 'Inserted';
        let existingDocId;
        if (numberOfHits === 1) {
          // Document exists, we'll replace it
          operation = 'Replaced';
          existingDocId = searchResult.hits.hits[0]._id;
        }

        // Use the index API to replace the document or create a new one
        await client.index({
          index: currentIndex,
          id: existingDocId,
          body: response,
          pipeline: 'chc-pipeline'
        });

        return c.json({ status: 'ok', message: `${operation} document with id ${id}` });
      } catch (err) {
        if (err instanceof HTTPException) {
          throw err;  // Re-throw our custom error
        }
        console.error('Error replacing/inserting document:', err);
        throw new HTTPException(500, { message: 'Error replacing/inserting document' });
      }

    } catch (error) {
      // Handle the error here
      console.error(error);
      throw new HTTPException(500, { message: 'Internal Server Error' })
    }
  }
)

export default route