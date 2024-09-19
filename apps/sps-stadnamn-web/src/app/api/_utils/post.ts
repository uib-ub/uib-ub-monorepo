export async function postQuery(dataset: string, query: any, retry: boolean = true) {
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST
    
    const res = await fetch(`${endpoint}search-stadnamn-${process.env.SN_ENV}-${dataset}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(query)
    });

    
    if (!res.ok) {
        const errorResponse = await res.json();
        if (retry) {
            return postQuery(dataset, query, false);
        } else {
            console.log("ERROR", JSON.stringify(errorResponse, null, 2));
            return {error: errorResponse.error.type.toUpperCase(), status: errorResponse.status};
        }
    }

    const responseData = await res.json();
    return responseData;
}