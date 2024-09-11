import client from '@config/apis/esClient'
import { CHCSEARCHALIAS, DATA_SOURCES, INDICIES } from '@config/constants'
import { env } from '@config/env'
import { bulkIndexData } from '@helpers/indexers/bulkIndexData'
import { flatMapDataForBulkIndexing } from '@helpers/indexers/flatMapDataForBulkIndexing'
import { getIndexFromAlias } from '@lib/getIndexFromAlias'
import { getFileSets, resolveFileSets } from '@services/sparql/marcus/file_sets.service'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import pretty from 'pretty-time'

const route = new Hono()

let isRunning = false

route.get('/file-sets',
  async (c) => {
    const { index, limit = '250', page = '0', source, reindex } = c.req.query()

    if (!source) {
      return c.text('Missing query parameters', 400)
    }

    if (isRunning) {
      return c.text('Ingest already running', 400)
    }

    // Set isRunning to true to prevent multiple ingestions at the same time
    isRunning = true

    // Get the index name
    const useIndex = index ?? await getIndexFromAlias(CHCSEARCHALIAS, INDICIES.file_set, reindex != undefined ? true : false)
    console.log("Using index:", useIndex)

    const limitInt = parseInt(limit)
    const pageInt = parseInt(page)

    const SOURCE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
    const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

    console.log('Starting ingester')

    return streamSSE(c, async (stream) => {
      // Set initial values
      let id = 0
      let status = {
        message: '',
        currentPage: pageInt,
        fetched: 0,
        indexed: 0,
        runtime: BigInt(0),
      }

      await stream.writeSSE({
        data: JSON.stringify({ ...status, message: `Starting ingester using the index ${useIndex} (with ${CHCSEARCHALIAS} as alias)` }, (_, v) => typeof v === 'bigint' ? v.toString() : v),
        event: 'start',
        id: String(id),
      })


      while (true) {
        console.log('Fetching page', status.currentPage);

        // Increment id for SSE messages
        id++

        // Fetch ids
        const t0 = process.hrtime.bigint();
        const data = await getFileSets(SOURCE_URL, CONTEXT, status.currentPage, limitInt);
        const t1 = process.hrtime.bigint();
        console.log('├── Fetched ids:', data.length, 'items in', pretty(Number(t1) - Number(t0)));

        status.fetched += data.length;

        try {
          const t2 = process.hrtime.bigint();
          const resolved = await resolveFileSets(data, SOURCE_URL);
          const t3 = process.hrtime.bigint();
          console.log('├── Resolved', data.length, 'items in', pretty(Number(t3) - Number(t2)));

          const t4 = process.hrtime.bigint();
          const bulkPayload = flatMapDataForBulkIndexing(resolved, useIndex);
          const t5 = process.hrtime.bigint();
          console.log('├── Prepared the payload for bulk indexing.', bulkPayload.length / 2, 'items in', pretty(Number(t5) - Number(t4)));

          const t8 = process.hrtime.bigint();
          const indexStatus: any = await bulkIndexData(bulkPayload, useIndex) ?? 0;
          const t9 = process.hrtime.bigint();
          console.log('└── Indexed', indexStatus.count, 'items in', pretty(Number(t9) - Number(t8)));

          // Update status
          status.indexed += indexStatus.count;
          status.currentPage += 1;
          status.runtime += process.hrtime.bigint() - t0;

          await stream.writeSSE({
            data: JSON.stringify({ ...status, message: 'Ingesting...' }, (_, v) => typeof v === 'bigint' ? v.toString() : v),
            event: 'progress',
            id: String(id),
          });


        } catch (iterationError) {
          console.log('Error in loop iteration:', iterationError);
          await stream.writeSSE({
            data: `Error in loop iteration: ${iterationError}`,
            event: 'error',
            id: String(id),
          });
          stream.close();
          return
        }

        // If no more items to fetch, break the loop
        if (data.length < limitInt) {
          // Increment id for SSE messages
          id++
          console.log(`Finished ingesting in ${pretty(Number(status.runtime))}`);
          await stream.writeSSE({
            data: JSON.stringify({ ...status, message: 'Finished ingesting' }, (_, v) => typeof v === 'bigint' ? v.toString() : v),
            event: 'finished',
            id: String(id),
          });

          // Update aliases
          if (reindex != undefined) {
            try {
              await client.indices.updateAliases({
                body: {
                  actions: [
                    {
                      remove: {
                        index: `${INDICIES.items}_*`,
                        alias: CHCSEARCHALIAS,
                      },
                    },
                    {
                      add: {
                        index: useIndex,
                        alias: CHCSEARCHALIAS,
                      },
                    },
                  ],
                },
              });

              console.log('Aliases updated');

              // Increment id for SSE messages
              id++

              await stream.writeSSE({
                data: `Updated aliases`,
                event: 'finished',
                id: String(id),
              });
            } catch (error) {
              console.log('Error updating aliases:', error);

              await stream.writeSSE({
                data: `Error updating aliases: ${error}`,
                event: 'error',
                id: String(id),
              });

              stream.close();
              return;
            }
          }

          // Set isRunning to false to allow new ingest
          isRunning = false
          stream.close();
          return
        }
      }
    })
  })

export default route