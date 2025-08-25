
export async function postQuery(dataset: string, query: any, search_type?: string, enableCache = false, cacheTags: string[] = ['all']): Promise<any[]> {
    
    // TODO: use the same variable name in prod and test
    const endpoint = process.env.STADNAMN_ES_ENDPOINT
    const token = process.env.STADNAMN_ES_TOKEN
    let res

    


    try {
        res = await fetch(`${endpoint}search-stadnamn-${process.env.SN_ENV}-${dataset}/_search${search_type ? `?search_type=${search_type}` : ''}`, {
            ...enableCache ? {cache: 'force-cache',next: {tags: cacheTags}} : {cache: 'no-store'},
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
    else {
        const responseData = await res.json();
        return [responseData, 200]
    }
}