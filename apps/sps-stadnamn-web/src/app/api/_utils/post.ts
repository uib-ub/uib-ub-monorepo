
export async function postQuery(perspective: string, query: any, search_type?: string, cacheTags: string[] = ['all']): Promise<any[]> {
    
    // TODO: use the same variable name in prod and test
    const endpoint = process.env.STADNAMN_ES_ENDPOINT
    const token = process.env.STADNAMN_ES_TOKEN
    let res

    const url = `${endpoint}search-stadnamn-${process.env.SN_ENV}-${perspective}/_search${search_type ? `?search_type=${search_type}` : ''}`

    
    try {
        res = await fetch(url, {
            cache: 'force-cache', next: {tags: cacheTags},
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