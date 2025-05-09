export async function postQuery(dataset: string, query: any, retry: boolean = true) {
    const datasetQuery = dataset == "all" ? 
    `*,-search-stadnamn-${process.env.SN_ENV}-vocab,-search-stadnamn-${process.env.SN_ENV}-iiif_*,-search-stadnamn-${process.env.SN_ENV}-search,-search-stadnamn-${process.env.SN_ENV}-nbas*,-search-stadnamn-${process.env.SN_ENV}-leks_g` : dataset
    
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    console.log("ENDPOINT", endpoint)
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST
    let res
    try {
        res = await fetch(`${endpoint}search-stadnamn-${process.env.SN_ENV}-${datasetQuery}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(query)
    });
    }
    catch (e) {
        console.error(e)
        return [{error: e}, 500]
    }

    
    if (!res.ok) {
        if (retry) {
            return postQuery(datasetQuery, query, false);
        } else {
            const contentType = res.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const errorResponse = await res.json();
                console.error(errorResponse);
                return [errorResponse, res.status];

            } else {
                // Handle non-JSON responses
                const textResponse = await res.text();
                console.error(textResponse);
                return [{error: textResponse}, res.status];
            
            }
        }
    }
    else {
        const responseData = await res.json();
        return [responseData, 200]
    }
}