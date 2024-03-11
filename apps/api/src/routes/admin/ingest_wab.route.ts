import { OpenAPIHono } from '@hono/zod-openapi';
import { getSkaAgents } from '../../services/sparql/legacy/ska/getSkaAgents';
import { chunk } from '../../helpers/chunk';
import { flatMapDataForBulkIndexing } from '../../helpers/flatMapDataForBulkIndexing';
import { indexData } from '../../helpers/indexData';
import { getSkaDocuments } from '../../services/sparql/legacy/ska/getSkaDocuments';
import { getSkaTopics } from '../../services/sparql/legacy/ska/getSkaTopics';
import { listWabBemerkung } from '../../services/sparql/legacy/wab/list-wab-bemerkung';
import { resolveIds } from '../../helpers/resolveIds';
import { resolveWabIds } from '../../helpers/resolveWabIds';

interface IndexDataResponse {
  count: number;
  errors: string[];
}

const route = new OpenAPIHono();

route.get('/ingest/legacy/wab', async (c) => {
  const index = "search-legacy-wab"
  const page = 0
  try {
    // Set initial values
    let currentPage = page;
    let totalFetched = 0;
    let totalIndexed = 0;
    let totalRuntime = 0;
    let errors: any[] = []

    while (true) {
      // Sample time for fetch and index step
      const t0 = performance.now();
      const ids = await listWabBemerkung(currentPage, 100);
      totalFetched += ids.length;

      // Break if there are no more ids to fetch
      if (ids.length === 0) {
        break;
      }
      try {
        const resolved = await resolveWabIds(ids);
        const preparedData = flatMapDataForBulkIndexing(resolved, index);
        const indexStatus = await indexData(preparedData, index) as IndexDataResponse;

        const took = performance.now() - t0;
        totalIndexed += indexStatus.count;
        currentPage += 1;
        totalRuntime += took;

        errors.push(...indexStatus.errors);

        console.log(`Indexed ${indexStatus.count} items in ${took} milliseconds. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`);
      } catch (iterationError) {
        console.log("Error in loop iteration:", iterationError);
        // Decide whether to continue the loop or break here
      }
    }
    // Convert totalRuntime to something human-readable
    const minutes = Math.floor(totalRuntime / 60000);
    const seconds = ((totalRuntime % 60000) / 1000).toFixed(0);


    console.log(`Indexed ${totalIndexed} items of ${totalFetched} ids in total into "${index}" from the source "wab". It took ${minutes}:${seconds} minutes.`);

    return c.json({
      index,
      timeTaken: `${minutes}:${seconds} minutes`,
      ingested: totalIndexed,
      ...(errors.length && { errors: errors }),
    });

  } catch (error) {
    return c.json({
      page,
      error
    }, 400)
  }
})

export default route;