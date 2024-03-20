export function getQueryString(params: { [key: string]: string | null }) {
  const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": [params.field || "label"]
    }} : null


    const highlight = params.q && params.field && params.field != 'label' ? {
        fields: {
            [params.field]: {}
        }
        } : null
    

    return { highlight, simple_query_string}
}