export async function fetchDoc(params: any, retry: boolean = true) {
    'use server'
    const endpoint = (process.env.SN_ENV == 'prod' && retry ) || !retry ? process.env.SN_ENDPOINT : process.env.SN_ENDPOINT_TEST
    const token = endpoint == process.env.SN_ENDPOINT ? process.env.SN_TOKEN : process.env.SN_TOKEN_TEST
    const res = await fetch(`${endpoint}stadnamn-${process.env.SN_ENV}-${params.dataset}/_doc/${params.uuid}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${token}`,
        }
    })

    if (retry && !res.ok) {
        return fetchDoc(params, retry = false);
  }
  const data = await res.json()
  return data

  }