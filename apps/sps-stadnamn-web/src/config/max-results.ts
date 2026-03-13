export const SMALL_BASE_MAX_RESULTS = 3
export const LARGE_BASE_MAX_RESULTS = 10

export const defaultMaxResultsParam = String(SMALL_BASE_MAX_RESULTS)
export const expandedMaxResultsParam = String(LARGE_BASE_MAX_RESULTS)

export function clampMaxResults(value: number): number {
  return Math.max(Math.trunc(value), SMALL_BASE_MAX_RESULTS)
}

export function getClampedMaxResultsFromParam(value: string | null): number {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return clampMaxResults(parsed)
}
