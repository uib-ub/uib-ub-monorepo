import client from '@shared/clients/es-client';

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
  // Finds the current index name in alias and based on the given indicesInAlias object find the latest index.
  let indicesInAlias;
  try {
    console.log("🔍 Attempting to get alias:", alias);
    indicesInAlias = await client.indices.getAlias({ name: alias });
    console.log("✅ Successfully got alias response");
  } catch (error) {
    console.log("❌ Error occurred while getting alias:", error);
    if (error.statusCode === 404) {
      // No alias found, return empty object to create first index
      indicesInAlias = {};
    } else {
      // Server error or other issues
      console.error('Error getting alias:', error);
      throw new Error(`Failed to get alias "${alias}": ${error.message}`);
    }
  }
  // Find all indices that match our exact index pattern (base_number)
  console.log("🚀 ~ getIndexFromAlias ~ indicesInAlias:", indicesInAlias)
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
