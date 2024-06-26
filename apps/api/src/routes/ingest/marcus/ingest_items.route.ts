import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { flatMapDataForBulkIndexing } from '@helpers/indexers/flatMapDataForBulkIndexing'
import { indexData } from '@helpers/indexers/indexData'
import { resolveIds } from '@helpers/indexers/resolveIds'
import { getItems } from '@services/sparql/marcus/items.service'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'

const route = new Hono()

function toSeconds(ms: number) {
  return (ms / 1000).toFixed(4)
}

route.get('/ingest',
  async (c) => {
    const { index, limit = '10', page = '0', source, type } = c.req.query()
    if (!index || !source || !type) {
      return c.text('Missing query parameters', 400)
    }

    const limitInt = parseInt(limit)
    const pageInt = parseInt(page)

    const SOURCE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
    const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

    console.log('Starting ingester')

    return streamSSE(c, async (stream) => {
      let id = pageInt

      await stream.writeSSE({
        data: 'Starting ingester',
        event: 'start',
        id: String(id++),
      })

      // Set initial values
      let currentPage = pageInt;
      let totalFetched = 0;
      let totalIndexed = 0;
      let totalRuntime = 0;
      let errors: any[] = []

      while (true) {
        console.log('Fetching page', currentPage);
        // Sample time for fetch and index step
        const t0 = performance.now();
        const data = await getItems(SOURCE_URL, CONTEXT, currentPage, limitInt);
        const t1 = performance.now();
        console.log('Fetched', data.length, 'items in', toSeconds(t1 - t0), 'seconds');
        totalFetched += data.length;

        try {
          const resolved = await resolveIds(data, SOURCE_URL);
          const t2 = performance.now();
          console.log('Resolved', resolved.length, 'items in', toSeconds(t2 - t1), 'seconds');
          const preparedData = flatMapDataForBulkIndexing(resolved, index);
          const t3 = performance.now();
          console.log('Prepared', preparedData.length / 2, 'items in', toSeconds(t3 - t2), 'seconds');
          const indexStatus: any = await indexData(preparedData, index) ?? 0;
          const t4 = performance.now();
          console.log('Indexed', indexStatus.count, 'items in', toSeconds(t4 - t3), 'seconds');

          const took = performance.now() - t0;
          totalIndexed += indexStatus.count;
          currentPage += 1;
          totalRuntime += took;

          errors = indexStatus.errors

          await stream.writeSSE({
            data: `Indexed ${indexStatus.count} items in ${toSeconds(took)} seconds. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`,
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
    })
  })

export default route