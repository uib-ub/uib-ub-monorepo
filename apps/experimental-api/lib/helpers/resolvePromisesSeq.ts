export const resolvePromisesSeq = async (tasks: any[]) => {
  const results: any[] = [];
  for (const task of tasks) {
    results.push(await task);
  }

  return results;
};