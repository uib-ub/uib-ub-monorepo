import { SearchDataStats } from "../composables/states";

export function resetStats(stats: SearchDataStats, deleteStats: boolean) {
  const newStats: SearchDataStats = Object.keys(stats).reduce(
    (o, category) => ({ ...o, [category]: {} }),
    {}
  );
  if (!deleteStats) {
    Object.keys(stats).forEach((key) => {
      Object.keys(stats[key as keyof SearchDataStats]).forEach((nestedKey) => {
        newStats[key as keyof SearchDataStats][nestedKey] = 0;
      });
    });
  }
  return newStats;
}
