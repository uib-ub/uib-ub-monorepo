// Centralized param key definitions used for typing and filtering.
// Keep this file dependency-light (shared by client + server code).

/**
 * Search params that are "reserved" in the sense that they are not treated as
 * field facets / field filters by default query parsing.
 *
 * NOTE: This is also used on the server (API routes) to separate filter params
 * from "control" params.
 */
export const RESERVED_SEARCH_PARAM_KEYS = [
  'q',
  'display',
  'perspective',
  'datasetTag',
  'page',
  'groupPage',
  'asc',
  'desc',
  'fulltext',
  'fuzzy',
  'facetSort',
  'fields',
  'size',
  'from',
  'topLeftLat',
  'topLeftLng',
  'bottomRightLat',
  'bottomRightLng',
  'doc',
  'facetSearch',
  'totalHits',
  'facets',
  'zoom',
  'point',
  'activePoint',
  'activeYear',
  'activeName',
  'radius',
  'facetQuery',
  'mode',
  'geotile',
  'sourceView',
  'init',
  'group',
  'maxResults',
  'mapSettings',
  'overlaySelector',
  'debug',
  'debugGroups',
  'includeSuppressed',
  'searchSort',
  'tree',
  'noGeo',
] as const

export type ReservedSearchParamKey = (typeof RESERVED_SEARCH_PARAM_KEYS)[number]
export const RESERVED_SEARCH_PARAM_KEY_SET: ReadonlySet<string> = new Set(RESERVED_SEARCH_PARAM_KEYS as readonly string[])

/**
 * Params that only affect client UI state and must never influence the server/API query.
 *
 * If a param is used as part of filtering / scoring / dataset selection, it does NOT
 * belong here.
 */
export const CLIENT_ONLY_SEARCH_PARAM_KEYS = [
  'display',
  'page',
  'groupPage',
  'facetSort',
  'facetSearch',
  'totalHits',
  'facets',
  'zoom',
  'activePoint',
  'activeYear',
  'activeName',
  'mode',
  'geotile',
  'init',
  'mapSettings',
  'overlaySelector',
  'debug',
  'debugGroups',
  'results'
] as const

export type ClientOnlySearchParamKey = (typeof CLIENT_ONLY_SEARCH_PARAM_KEYS)[number]
export const CLIENT_ONLY_SEARCH_PARAM_KEY_SET: ReadonlySet<string> = new Set(CLIENT_ONLY_SEARCH_PARAM_KEYS as readonly string[])

export function isClientOnlySearchParamKey(key: string): key is ClientOnlySearchParamKey {
  return CLIENT_ONLY_SEARCH_PARAM_KEY_SET.has(key)
}
