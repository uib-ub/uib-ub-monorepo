function modifyQuery(query: string) {
  const lowerCaseQuery = query.toLowerCase();

  if (lowerCaseQuery.includes('aa')) {
    return `(${query}) OR (${query.replace(/aa/gi, 'å')})`;
  }

  if (lowerCaseQuery.includes('å')) {
    return `(${query}) OR (${query.replace(/å/gi, 'aa')})`;
  }

  return query;
}

export function getQueryString(params: { [key: string]: string | null }) {

  const simple_query_string = params.q ? {
    "query_string": {
      "query": modifyQuery(params.q),
      "allow_leading_wildcard": true,
      "default_operator": params.field ? "OR" : "AND",
      "fields": [params.field || "label"]
    }} : null

  const highlight = params.q && params.field && params.field != 'label' ? {
    fields: {
        [params.field]: {}
    }
    } : null

  return { highlight, simple_query_string}
}