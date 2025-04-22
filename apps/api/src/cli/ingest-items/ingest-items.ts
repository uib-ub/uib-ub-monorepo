import client from '@shared/clients/es-client'
import { CHC_SEARCH_ALIAS, CHC_INDICIES } from '@shared/constants'
import { bulkIndexData } from '@shared/lib/indexers/utils/bulkIndexData'
import { flatMapDataForBulkIndexing } from '@shared/lib/indexers/utils/flatMapDataForBulkIndexing'
import pretty from 'pretty-time'
import { getIndexFromAlias } from '@shared/utils/getIndexFromAlias'
import { fetchItemsCount } from '@cli/ingest-items/fetch-items-count'
import { fetchItemsList, InputItem } from '@cli/ingest-items/fetch-items-list'
import { fetchAndProcessItem } from '@cli/ingest-items/fetch-item'

export const resolveItems = async (items: InputItem[]) => {
  try {
    const promises = items
      .map(item => fetchAndProcessItem(item.identifier))
      .filter(Boolean)
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error resolving items:', error)
  }
}

export const ingestItems = async (limit = 100, page = 0, overwrite = false) => {
  const count = await fetchItemsCount()
  console.log("🚀 ~ ingestItems ~ count:", count)

  // Get the index name
  const useIndex = await getIndexFromAlias(CHC_SEARCH_ALIAS, CHC_INDICIES.items, overwrite)

  // Set initial values
  let status = {
    currentPage: page,
    totalCount: count,
    fetched: 0,
    indexed: 0,
    runtime: BigInt(0),
  }

  console.log(`Starting ingester using the index ${useIndex} (with ${CHC_SEARCH_ALIAS} as alias)`)

  while (true) {
    console.log('Fetching page', status.currentPage);
    // Fetch ids
    const t0 = process.hrtime.bigint();
    const data = await fetchItemsList(status.currentPage * limit, limit);
    const t1 = process.hrtime.bigint();
    console.log('├── Fetched', data.length, 'ids in', pretty(Number(t1) - Number(t0)));

    status.fetched += data.length;

    try {
      // Resolve ids
      const t2 = process.hrtime.bigint();
      const resolved = await resolveItems(data);
      const t3 = process.hrtime.bigint();
      console.log('├── Resolved', resolved.length, 'items in', pretty(Number(t3) - Number(t2)));

      // Prepare bulk payload
      const t6 = process.hrtime.bigint();
      const bulkPayload = flatMapDataForBulkIndexing(resolved, useIndex);
      const t7 = process.hrtime.bigint();
      console.log('├── Prepared the payload for bulk indexing,', bulkPayload.length / 2, 'items in', pretty(Number(t7) - Number(t6)));

      // Index data
      const t8 = process.hrtime.bigint();
      const indexStatus: any = await bulkIndexData(bulkPayload, useIndex) ?? 0;
      const t9 = process.hrtime.bigint();
      status.indexed += indexStatus.count;
      console.log('└── Indexed', indexStatus.count, '.', ((status.indexed * 100) / status.totalCount).toFixed(3), '% of', status.totalCount, 'in', pretty(Number(t9) - Number(t8)));

      // Update status
      status.currentPage += 1;
      status.runtime += process.hrtime.bigint() - t0;

    } catch (iterationError) {
      console.log('Error in loop iteration:', iterationError);
      return
    }

    // If no more items to fetch, break the loop
    if (data.length < limit) {
      console.log(`Finished ingesting in ${pretty(Number(status.runtime))}`);

      // Update aliases
      if (!overwrite) {
        try {
          await client.indices.updateAliases({
            body: {
              actions: [
                {
                  remove: {
                    index: `${CHC_INDICIES.items}_*`,
                    alias: CHC_SEARCH_ALIAS,
                  },
                },
                {
                  add: {
                    index: useIndex,
                    alias: CHC_SEARCH_ALIAS,
                  },
                },
              ],
            },
          });
          console.log('Aliases updated');
        } catch (error) {
          console.log('Error updating aliases:', error);
          return;
        }
      }
      return
    }
  }
}
