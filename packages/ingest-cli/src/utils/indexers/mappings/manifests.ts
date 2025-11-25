/**
 * @fileoverview elasticsearch mapping for manifests
 */

/**
 * Manifest mapping
 * We are disabling the mapping for the manifest object, as we only serve it with no search capabilities.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/enabled.html
 */
export const manifests = {
  "properties": {
    "id": {
      "type": "keyword",
    },
    "manifest": {
      "type": "object",
      "enabled": false
    },
  }
}