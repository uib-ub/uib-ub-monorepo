import { fulltextFields } from "@/config/search-config";

function modifyQuery(query: string) {
  const lowerCaseQuery = query.toLowerCase();

  // Escape special characters
  let escapedQuery = lowerCaseQuery.replace(/([=&&||!(){}[\]^:\\/])/g, '\\$1');

  // Remove < and >, as they cannot be escaped
  escapedQuery = escapedQuery.replace(/[<>]/g, '');

  if (lowerCaseQuery.includes('aa')) {
    return `(${escapedQuery}) OR (${escapedQuery.replace(/aa/gi, 'å')})`;
  }

  if (lowerCaseQuery.includes('å')) {
    return `(${escapedQuery}) OR (${escapedQuery.replace(/å/gi, 'aa')})`;
  }

  return escapedQuery;
}

export function getQueryString(params: { [key: string]: string | null }) {
  const fulltext = params.fulltext == 'on'
  const perspective = params.perspective || 'all'

  const simple_query_string: any = params.q ? {
    query_string: {
      query: modifyQuery(params.q),
      allow_leading_wildcard: true,
      default_operator: "AND", // params.fulltext ? 'AND' : 'OR',
      fields: ["label^5", "altLabels^4", "attestations.label^3", ...fulltext ? fulltextFields[perspective]?.map(item => item.key + '^2') : [], "adm1^1", "adm2^1", "group.adm1^1", "group.adm2^1"]
    }
  } : null




  //const test = fulltext && params.dataset ? Object.fromEntries(fulltextFields[params.dataset].map(item => ([item.key, {}]))) : {}


  const highlight = params.q && fulltext ? {
    pre_tags: ["<mark>"],
    post_tags: ["</mark>"],
    boundary_scanner_locale: "nn-NO",

    fields: {
      "altLabels": {},
      "attestations.label": {},
      //...test,
      ...fulltext ? Object.fromEntries(fulltextFields[perspective].map(item => ([item.key, {}]))) : {}
    }
  } : null

  return { highlight, simple_query_string }
}
