import client from '@config/apis/esClient';

/**
 * Retrieves the latest index name based on the given alias and index.
 * 
 * @param alias - The alias name.
 * @param index - The index name.
 * @param reindex - A boolean indicating whether to increment the index iteration.
 * @returns The latest index name.
 */
export const getIndexFromAlias = async (alias: string, index: string, reindex: boolean) => {
  // Finds the current index name in alias and based on the given indicesInAlias object find the latest index.
  const indicesInAlias = await client.indices.getAlias({ name: alias });
  const currentIndex = Object.keys(indicesInAlias).find(k => k.startsWith(index));
  const currentIndexIteration = currentIndex ? parseInt(currentIndex.split('_')[1]) : 0;

  // Split currentIndex on "_" and if the last part is a number, increment it by 1. If not, add "_1" to the index name.
  return `${index}_${currentIndexIteration + (reindex ? 1 : 0)}`;
};
