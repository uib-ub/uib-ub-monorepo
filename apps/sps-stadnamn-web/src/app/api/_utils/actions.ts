export async function fetchDoc(params: any, retry: boolean = true) {
    'use server'
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST
    const res = await fetch(`${endpoint}stadnamn-${process.env.SN_ENV}-${params.dataset}/_doc/${params.uuid}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${token}`,
        }
    })

    if (!res.ok) {
        const errorResponse = await res.json();
        if (retry) {
            return fetchDoc(params, retry = false);
        }
        return {error: errorResponse.error.type.toUpperCase(), status: errorResponse.status};
    }
  const data = await res.json()
  return data

  }