import client from '@config/apis/esClient';

/**
 * Retrieves the latest index name based on the given alias and index.
 * Also cleans up old indices by removing aliases from older versions.
 * 
 * @param alias - The alias name.
 * @param index - The index name (without increment).
 * @param overwrite - A boolean indicating whether to overwrite the latest index.
 * @returns The latest index name.
 */
export const getIndexFromAlias = async (alias: string, index: string, overwrite = false) => {
  console.log("🚀 ~ getIndexFromAlias ~ alias:", alias)
  console.log("🚀 ~ getIndexFromAlias ~ index:", index)
  console.log("🚀 ~ getIndexFromAlias ~ overwrite:", overwrite)

  // Finds the current index name in alias and based on the given indicesInAlias object find the latest index.
  const indicesInAlias = await client.indices.getAlias({ name: alias });
  console.log("🚀 ~ getIndexFromAlias ~ indicesInAlias:", indicesInAlias)

  // Find all indices that match our exact index pattern (base_number)
  const matchingIndices = Object.keys(indicesInAlias).filter(k => k.startsWith(index));

  // Sort indices by their numeric suffix
  const sortedIndices = matchingIndices.sort((a, b) => {
    const numA = parseInt(a.split('_')[1] || '0');
    const numB = parseInt(b.split('_')[1] || '0');
    return numA - numB;
  });

  if (matchingIndices.length > 1) {
    // Remove alias from all but the latest index
    const indicesToRemove = sortedIndices.slice(0, -1);
    for (const oldIndex of indicesToRemove) {
      await client.indices.deleteAlias({
        index: oldIndex,
        name: alias
      });
    }
  }

  // Get the latest index (last one after sorting)
  const latestIndex = sortedIndices[sortedIndices.length - 1];
  const currentIteration = latestIndex ? parseInt(latestIndex.split('_')[1] || '0') : 0;

  // If overwrite is true, use the current iteration, otherwise increment
  return `${index}_${overwrite ? currentIteration : currentIteration + 1}`;
};
