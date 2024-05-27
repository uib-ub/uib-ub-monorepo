export async function fetchDoc(params: any, firstAttempt: boolean = true) {
    'use server'
    const endpoint = (process.env.SN_ENV == 'prod' ? firstAttempt : !firstAttempt) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
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
        if (firstAttempt) {
            return fetchDoc(params, firstAttempt = false);
        }
        return {error: errorResponse.error.type.toUpperCase(), status: errorResponse.status};
    }
  const data = await res.json()
  return data

  }


export async function fetchSOSI(sosiCode: string) {
    'use server'
    const res = await fetch("https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + sosiCode + ".json", {
        method: 'GET'
    })

    if (!res.ok) {
        // TODO: load backup jeson of all navneobjekttype
        return {};
    }
  const data = await res.json()
  return data

  }