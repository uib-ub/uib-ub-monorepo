// Centralized param key definitions used for typing and filtering.
// Keep this file dependency-light (shared by client + server code).
// Type checking utilized by all api routes that accept filter parameters.
// This will prevent collisions between fields and params only used in the UI.

/**
 * URL search params that the server/API may accept and use as "control" params
 * (i.e. they must never be treated as data-field filters).
 *
 * This list intentionally excludes client-only UI state keys to avoid having to
 * repeat the same key in multiple lists.
 * 
 * 
 */
export const SERVER_ALLOWED_SEARCH_PARAM_KEYS = [
  
  'q',
  'datasetTag',
  'group',
  'radius', // Not in use yet
  'includeSuppressed', // Cadastral view shows suppressed results
  'point',
  'perspective',
  'size',
  'from',
  'topLeftLat',
  'topLeftLng',
  'bottomRightLat',
  'bottomRightLng',
  'asc',
  'desc',
  'fields',
  'sourceView',
  'sort',
  'id', // group id or uuid for result card
  'totalHits',
  'searchSort',
  'facetQuery', // Only used in wikiAdm - deprecated?
  'fulltext',
  'fuzzy',
  'facets',
  'facet',
  'facetSearch',
  'facetSort', // Not currently in use?
  'doc', // Still used in table explorer
  'within' // Also a field in elasticsearch

  //'dataset', TODO: add dataset and adm

] as const

export const SPECIAL_CASE_FACETS = ['name', 'year'] as const


/**
 * Client-only UI state keys.
 *
 * These keys are allowed to exist in the URL (for shareable UI state), and they
 * may also be sent in a POST body, but they must never influence the server/API query.
 */
    export const CLIENT_ONLY_SEARCH_PARAM_KEYS = [
    'options',
    'mode',
    'page',
    'perPage',
    'mapSettings',
    'overlaySelector',
    'init',
    'activePoint',
    'tree',
    'center',
    'zoom',
    'debug',
    'debugGroups',
    'noGeo', // passed in request body
    'hideResults',
    'resultLimit'


    /*
  'results'
  */
] as const

/**
 * Full set of reserved param names (not allowed as data field names).
 *
 * This is used by both client and server when separating field filters from control params.
 */
export const RESERVED_SEARCH_PARAM_KEYS = [
  ...SERVER_ALLOWED_SEARCH_PARAM_KEYS,
  ...CLIENT_ONLY_SEARCH_PARAM_KEYS,
] as const

// Compile-time safeguard: server-allowed and client-only keys must never overlap.
type SearchParamKeyOverlap = Extract<
  (typeof SERVER_ALLOWED_SEARCH_PARAM_KEYS)[number],
  (typeof CLIENT_ONLY_SEARCH_PARAM_KEYS)[number]
>
type AssertNoSearchParamKeyOverlap<T extends never> = T
type _NoSearchParamKeyOverlapCheck = AssertNoSearchParamKeyOverlap<SearchParamKeyOverlap>

export type ServerAllowedSearchParamKey = (typeof SERVER_ALLOWED_SEARCH_PARAM_KEYS)[number]
export const SERVER_ALLOWED_SEARCH_PARAM_KEY_SET: ReadonlySet<string> = new Set(
  SERVER_ALLOWED_SEARCH_PARAM_KEYS as readonly string[],
)

export function isServerAllowedSearchParamKey(key: string): key is ServerAllowedSearchParamKey {
  return SERVER_ALLOWED_SEARCH_PARAM_KEY_SET.has(key)
}

/**
 * Convenience type for server-side parsing of URL search params.
 * Compile-time only: accessing a key not in `SERVER_ALLOWED_SEARCH_PARAM_KEYS` is a TS error.
 */
export type ServerAllowedParams = Partial<Record<ServerAllowedSearchParamKey, string | null>>

export type ReservedSearchParamKey = (typeof RESERVED_SEARCH_PARAM_KEYS)[number]
export const RESERVED_SEARCH_PARAM_KEY_SET: ReadonlySet<string> = new Set(
  RESERVED_SEARCH_PARAM_KEYS as readonly string[],
)

/**
 * Params that only affect client UI state and must never influence the server/API query.
 *
 * If a param is used as part of filtering / scoring / dataset selection, it does NOT
 * belong here.
 */


export type ClientOnlySearchParamKey = (typeof CLIENT_ONLY_SEARCH_PARAM_KEYS)[number]
export const CLIENT_ONLY_SEARCH_PARAM_KEY_SET: ReadonlySet<string> = new Set(
  CLIENT_ONLY_SEARCH_PARAM_KEYS as readonly string[],
)

export function isClientOnlySearchParamKey(key: string): key is ClientOnlySearchParamKey {
  return CLIENT_ONLY_SEARCH_PARAM_KEY_SET.has(key)
}
