/**
 * Create nested dictionary with related ressources of starting entry.
 *
 * @param data - Nested dictionaries with concept data
 * @param startId - key for starting point in dict
 * @param relation - relation to follow
 * @param newKey - Key to nest related entries under
 */
export function parseRelationsRecursively(
  data: object,
  startId: string,
  relation: string,
  newKey: string,
) {
  if (data?.[startId]?.[relation] && data[startId][relation].length > 0) {
    const relations = data[startId][relation].slice().reverse();

    return Object.assign(
      {},
      ...relations.map((startId: string) => ({
        [startId]: {
          [newKey]: parseRelationsRecursively(data, startId, relation, newKey),
        },
      })),
    );
  }
  else {
    return null;
  }
}
