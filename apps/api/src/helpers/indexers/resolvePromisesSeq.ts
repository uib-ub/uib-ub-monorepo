/**
 * Resolves an array of promises sequentially.
 * 
 * @param tasks - An array of promises to be resolved sequentially.
 * @returns A promise that resolves to an array of results in the same order as the input promises.
 */
export const resolvePromisesSeq = async (tasks: any[]) => {
  const results: any[] = [];
  for (const task of tasks) {
    results.push(await task);
  }

  return results;
};