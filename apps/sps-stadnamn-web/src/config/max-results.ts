export const DEFAULT_MAX_RESULTS = 5
export const MIN_MAX_RESULTS = 5
export const EXPANDED_MAX_RESULTS = 10

export const defaultMaxResultsParam = String(DEFAULT_MAX_RESULTS)
export const expandedMaxResultsParam = String(EXPANDED_MAX_RESULTS)

export function clampMaxResults(value: number): number {
  return Math.max(Math.trunc(value), MIN_MAX_RESULTS)
}

export function getClampedMaxResultsFromParam(value: string | null): number {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return clampMaxResults(parsed)
}
