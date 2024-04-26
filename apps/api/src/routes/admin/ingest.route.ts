import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { getItems } from '../../services/legacy_items.service'
import { DOMAIN, DATA_SOURCES } from '../../config/constants'
import { flatMapDataForBulkIndexing } from '../../helpers/indexers/flatMapDataForBulkIndexing'
import { resolveIds } from '../../helpers/indexers/resolveIds'
import { indexData } from '../../helpers/indexers/indexData'

const route = new Hono()

route.get('/ingest',
  async (c) => {
    const { index, limit = '100', source, type } = c.req.query()
    if (!index || !source || !type) {
      return c.text('Missing query parameters', 400)
    }

    const limitInt = parseInt(limit)

    const API_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
    const CONTEXT = `${DOMAIN}/ns/ubbont/context.json`

    return streamSSE(c, async (stream) => {
      let id = 0

      await stream.writeSSE({
        data: 'Starting ingester',
        event: 'start',
        id: String(id++),
      })

      while (true) {
        // Set initial values
        let currentPage = 0;
        let totalFetched = 0;
        let totalIndexed = 0;
        let totalRuntime = 0;
        let errors: any[] = []

        while (true) {
          // Sample time for fetch and index step
          const t0 = performance.now();
          const data = await getItems(API_URL, CONTEXT, currentPage, limitInt);
          totalFetched += data.length;

          try {
            const resolved = await resolveIds(data, API_URL, CONTEXT, type!);
            const preparedData = flatMapDataForBulkIndexing(resolved, index!);
            const indexStatus: any = await indexData(preparedData, index!) ?? 0;

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
            return
          }
        }
      }
    })
  })

export default route