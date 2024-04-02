export function getQueryString(params: { [key: string]: string | null }) {
  const simple_query_string = params.q ? {
    "query_string": {
      "query": params.q,
      "allow_leading_wildcard": true,
      "default_operator": "AND",
      "fields": [params.field || "label"]
    }} : null


    const highlight = params.q && params.field && params.field != 'label' ? {
        fields: {
            [params.field]: {}
        }
        } : null
    

    return { highlight, simple_query_string}
}