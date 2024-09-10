import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { bulkIndexData } from '@helpers/indexers/bulkIndexData'
import { flatMapManifestsForBulkIndexing } from '@helpers/indexers/flatMapManifestsForBulkIndexing'
import { resolveManifests } from '@helpers/indexers/resolveManifests'
import { getItems } from '@services/sparql/marcus/items.service'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import isEmpty from 'lodash/isEmpty'

const route = new Hono()

route.get('/manifests',
  async (c) => {
    const { index, page = '0', limit = '100', source } = c.req.query()
    if (!index || !source) {
      return c.text('Missing query parameters', 400)
    }

    const type = "Manifest"
    const limitInt = parseInt(limit)

    const API_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
    const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`
    const IIIF_CONTEXT = `${env.PROD_URL}/ns/manifest/context.json`

    return streamSSE(c, async (stream) => {
      let id = 0

      await stream.writeSSE({
        data: 'Starting ingester',
        event: 'start',
        id: String(id++),
      })

      // Set initial values
      let currentPage = parseInt(page);
      let totalFetched = 0;
      let totalIndexed = 0;
      let totalRuntime = 0;
      let errors: any[] = []


      while (true) {

        // Sample time for fetch and index step
        const t0 = performance.now();
        const data = await getItems(API_URL, CONTEXT, currentPage, limitInt);
        // TODO: get true boolean from SPARQL
        const isDigitized = data.filter((item: any) => item.isDigitized === 'true');
        totalFetched += isDigitized.length;

        if (isEmpty(isDigitized)) {
          const took = performance.now() - t0;
          currentPage += 1;
          totalRuntime += took;

          await stream.writeSSE({
            data: `No digitized items found. Process took ${took} milliseconds. Page: ${currentPage}`,
            event: 'progress',
            id: String(id++),
          });

          continue
        };

        if (!isEmpty(isDigitized)) {
          try {
            const resolved = await resolveManifests(isDigitized, API_URL, IIIF_CONTEXT, type);
            const preparedData = flatMapManifestsForBulkIndexing(resolved, index);
            const indexStatus: any = await bulkIndexData(preparedData, index) ?? 0;

            const took = performance.now() - t0;
            totalIndexed += indexStatus.count;
            currentPage += 1;
            totalRuntime += took;

            errors.push(...indexStatus.errors);

            await stream.writeSSE({
              data: `Indexed ${indexStatus.count} items in ${took} milliseconds. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`,
              event: 'progress',
              id: String(id++),
            });
          } catch (iterationError) {
            await stream.writeSSE({
              data: `Error in loop iteration: ${iterationError}`,
              event: 'error',
              id: String(id++),
            });
            stream.close();
            return
          }

          // If no more items to fetch, break the loop
          if (data.length < limitInt) {
            console.log('Errors: ', errors);
            await stream.writeSSE({
              data: `No more items to fetch. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`,
              event: 'finished',
              id: String(id++),
            });
            stream.close();
            break
          }
          continue
        }
      }
    })
  })

export default route