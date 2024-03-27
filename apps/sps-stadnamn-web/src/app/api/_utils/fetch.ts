export async function postQuery(dataset: string, query: any, retry: boolean = true) {
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST

        const res = await fetch(`${endpoint}stadnamn-${process.env.SN_ENV}-${dataset}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(query)
    });

    
    if (!res.ok) {
        const errorResponse = await res.json();
        console.error('Elasticsearch error:', errorResponse);
        if (retry) {
            return postQuery(dataset, query, false);
        } else {
            throw new Error(`Request failed with status ${res.status}`);
        }
    }

    const responseData = await res.json();
    return responseData;
}