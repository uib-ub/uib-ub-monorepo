import { postQuery } from '../_utils/post';

function escapeQueryString(query: string) {
  // Escape Lucene query_string reserved characters.
  // See: + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /
  // Note: < and > cannot be escaped reliably; drop them.
  return query
    .replace(/[<>]/g, '')
    .replace(/([+\-=!(){}[\]^"~*?:\\/]|&&|\|\|)/g, '\\$1');
}

function escapeQueryStringPreserveWildcards(query: string) {
  // Escape Lucene query_string reserved characters, but keep * and ? intact
  // so user-entered wildcards continue to work (e.g. *berg).
  return query
    .replace(/[<>]/g, '')
    .replace(/([+\-=!(){}[\]^"~:\\/]|&&|\|\|)/g, '\\$1');
}

function buildPrefixQueryString(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Prefix-match each term, but preserve quoted phrases.
  // Example: berg -> berg*
  // Example: "berg en" -> "berg en"*
  const tokens = trimmed.match(/"[^"]+"|\S+/g) ?? [];
  return tokens
    .map((t) => {
      const isQuoted = t.startsWith('"') && t.endsWith('"') && t.length >= 2;
      const core = isQuoted ? t.slice(1, -1) : t;
      const escaped = escapeQueryString(core);
      const rewrapped = isQuoted ? `"${escaped}"` : escaped;
      return `${rewrapped}*`;
    })
    .join(' AND ');
}

function buildWildcardQueryString(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Preserve user wildcards. For non-wildcard tokens, we don't force prefixing here;
  // this clause is intended to support queries like *berg or berg* exactly as entered.
  const tokens = trimmed.match(/"[^"]+"|\S+/g) ?? [];
  return tokens
    .map((t) => {
      const isQuoted = t.startsWith('"') && t.endsWith('"') && t.length >= 2;
      const core = isQuoted ? t.slice(1, -1) : t;
      const escaped = escapeQueryStringPreserveWildcards(core);
      return isQuoted ? `"${escaped}"` : escaped;
    })
    .join(' ');
}

export async function fetchIIIFSearch(collection: string, q?: string, type?: string, size?: number, from?: number) {


  // Build query conditions
  const mustConditions = [];
  const mustNotConditions = [];

  // Add type filter if provided
  if (type) {
    mustConditions.push({
      "term": {
        "type": type
      }
    });
  }

  // Add collection filter if provided
  if (collection) {
    if (q) {
      mustConditions.push({
        "term": {
          ["collections.uuid"]: collection
        }
      });
    } else {
      mustConditions.push({
        "term": {
          ["partOf"]: collection
        }
      });
    }
  }

  // Add search query if provided
  if (q) {
    const boostedFields = ["label.*^3", "metadata.value.*^2", "canvases.label.*", "summary.*"];
    const prefixQuery = buildPrefixQueryString(q);
    const wildcardQuery = buildWildcardQueryString(q);

    mustConditions.push({
      "bool": {
        "should": [
          // Main relevance query (token-based full-text).
          {
            "simple_query_string": {
              "query": q,
              "fields": boostedFields,
              "default_operator": "or"
            }
          },
          // User wildcard support (e.g. *berg), similar to regular search behavior.
          ...(wildcardQuery ? [{
            "query_string": {
              "query": wildcardQuery,
              "fields": boostedFields,
              "default_operator": "AND",
              "allow_leading_wildcard": true,
              "analyze_wildcard": true
            }
          }] : []),
          // Prefix matching (e.g. "berg" -> "berg*") for label-ish fields.
          // Uses query_string + analyze_wildcard to get more intuitive prefix behavior
          // than simple_query_string across mixed mappings.
          ...(prefixQuery ? [{
            "query_string": {
              "query": prefixQuery,
              "fields": boostedFields,
              "default_operator": "AND",
              "allow_leading_wildcard": false,
              "analyze_wildcard": true
            }
          }] : [])
        ],
        "minimum_should_match": 1
      },
    });
  }

  // If no collection and no q, filter for top-level collections
  if (!collection && !q) {
    // Add Collection type if no specific type is requested


    // Exclude items with partOf
    mustNotConditions.push({
      "exists": {
        "field": "partOf"
      }
    });
  }

  // Build the final query
  const query = {
    "query": {
      "bool": {
        "must": mustConditions,
        "must_not": mustNotConditions
      }
    },
    "sort": q ? ["_score"] : ["order"],
    "size": size || 1000,
    "from": from || 0,
    "_source": ["uuid", "order", "images", "type", "label", "audio", "partOf"],
    "aggs": {
      "types": {
        "terms": {
          "field": "type",
          "size": 2
        }
      }
    }
  };

  const [response, status] = await postQuery('iiif_*', query)

  return { response, status }
}