import { bulkIndexData } from '@shared/lib/indexers/utils/bulkIndexData';
import { flatMapDataForBulkIndexing } from '@shared/lib/indexers/utils/flatMapDataForBulkIndexing';
import { listWabBemerkung } from '@cli/ingest-wab/list-wab-bemerkung';
import { resolveWabIds } from '@cli/ingest-wab/resolve-wab-ids';

interface IndexDataResponse {
  count: number;
  errors: string[];
}

export const ingestWab = async () => {
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
        const indexStatus = await bulkIndexData(preparedData, index) as IndexDataResponse;

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

    return {
      index,
      timeTaken: `${minutes}:${seconds} minutes`,
      ingested: totalIndexed,
      ...(errors.length && { errors: errors }),
    };

  } catch (error) {
    return {
      page,
      error
    }
  }
}