import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { getItems } from '../../services/sparql/legacy/getItems.service'
import { DOMAIN, DATA_SOURCES } from '../../config/constants'
import { flatMapDataForBulkIndexing } from '../../helpers/flatMapDataForBulkIndexing'
import { resolveIds } from '../../helpers/resolveIds'
import { indexData } from '../../helpers/indexData'
import { cleanJsonld } from '../../helpers/cleanJsonLd'

const app = new Hono()

// This is not as flexible as the params indicate, it is using the getItem function and this is for the new "stuff".

app.get('/ingest', async (c) => {
  const index = c.req.query('index')
  const limit = c.req.query('limit') ?? '100'
  const limitInt = parseInt(limit)
  const source = c.req.query('source')
  const type = c.req.query('type')

  if (!index || !source || !type) {
    return c.json({ message: 'Missing required parameters' }, 400)
  }

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
        const ids = cleanJsonld(data)
        totalFetched += ids.length;


        try {
          const resolved = await resolveIds(ids, API_URL, CONTEXT, type);
          const preparedData = flatMapDataForBulkIndexing(resolved, index);
          const indexStatus: any = await indexData(preparedData, index) ?? 0;

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
        if (ids.length < limitInt) {
          await stream.writeSSE({
            data: `No more items to fetch. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`,
            event: 'finished',
            id: String(id++),
          });
          stream.close();
          return
        }
        /* if (currentPage > 3) {
          await turnOnRefreshInterval(index!);
          await stream.writeSSE({
            data: 'Turned on refresh interval',
            event: 'cleanup',
            id: String(id++),
          })
          stream.close();
          return
        } */
      }
    }
  })
})

export default app