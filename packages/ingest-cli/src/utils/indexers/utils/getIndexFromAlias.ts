import client from '../../../clients/es-client';

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
  let indicesInAlias;
  try {
    // Attempt to get the alias; if it doesn't exist, that's fine (not an error)
    indicesInAlias = await client.indices.getAlias({ name: alias });
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      // Alias does not exist yet; return the first index name
      return `${index}_1`;
    } else {
      // Only log unexpected errors
      console.error('Error getting alias:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get alias "${alias}": ${error.message}`);
      }
      throw new Error(`Failed to get alias "${alias}": Unknown error`);
    }
  }

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
