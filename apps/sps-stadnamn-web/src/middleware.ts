import type { NextRequest } from 'next/server'
import { datasetTitles } from './config/metadata-config'
import { fetchIIFDocByIndex } from '@/app/api/_utils/actions'

const baseUrl = process.env.VERCEL_ENV === 'production' ? 'https://stadnamnportalen.uib.no' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

// Generic function to handle API calls with redirect or not found
async function handleApiRedirect(apiUrl: string, redirectPathFn?: (data: any) => string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
        const response = await fetch(apiUrl, { signal: controller.signal, cache: 'force-cache', next: { tags: ["all"] } });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            return new Response('Not found', { status: 404 });
        }
        
        const data = await response.json();
        
        if (redirectPathFn) {
            const redirectPath = redirectPathFn(data);
            return Response.redirect(baseUrl + redirectPath, 302);
        }
        
        return Response.json(data);
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return new Response('Request timeout', { status: 408 });
        }
        throw error;
    }
}

export async function middleware(request: NextRequest) {
    const url = new URL(request.url)
    const path = url.pathname.split('/')

    // Return 404 if /status and not dev
    if (path[1] == 'status' && process.env.NODE_ENV !== 'development') {
        return Response.redirect(baseUrl + '/404', 302)
    }

    if (path[1] == 'search') {
        const dataset = url.searchParams.getAll('dataset') || ['all']

        if (!dataset.every(d => datasetTitles[d])) {
            return Response.redirect(baseUrl + "/search", 302)
        }
        return
    }

    // Handle IIIF redirects for partOf/order format
    if (path[1] == 'iiif' && path.length === 4) {
        const partOf = path[2]  // 4238a470-68ac-309c-a7e8-0c72d99da0f8
        const order = path[3]   // 3
        
        // You'll need to determine the dataset - how do you know which dataset to search?
        
        try {
            const targetDoc = await fetchIIFDocByIndex({partOf, order})
            if (targetDoc?._id) {
                return Response.redirect(baseUrl + `/iiif/${targetDoc.fields.uuid[0]}`, 302)
            }
        } catch (error) {
            return new Response('Not found', { status: 404 });
        }
    }

    if (path[1] == 'view') {
        const searchParams = new URLSearchParams(url.searchParams)
        const dataset = path[2]
        if (path.length == 5 && path[3] == 'doc') {
            return handleApiRedirect(`${baseUrl}/api/uuid/${path[4]}`, () => "/uuid/" + path[4]);
        }
        if (path.length == 5 && path[3] == 'iiif') {
            return handleApiRedirect(`${baseUrl}/api/iiif/${path[4]}`, () => "/iiif/" + path[4]);
        }
        
        searchParams.set('dataset', dataset)
        
        return Response.redirect(baseUrl + "/search?" + searchParams.toString() , 302)
    }
    
    if (path[1] == 'snid') {
        const snid = path[2]
        const apiUrl = `${baseUrl}/api/snid?snid=${snid}`;
        return handleApiRedirect(apiUrl, (data) => "/uuid/" + data.hits.hits[0].fields.uuid[0]);
    }

    if (path[1] == 'find-snid') {
        const uuid = path[2]
        const apiUrl = `${baseUrl}/api/snid?uuid=${uuid}`;
        return handleApiRedirect(apiUrl, (data) => "/uuid/" + data.hits.hits[0].fields.uuid[0]);
    }

    if (["uuid", "iiif"].includes(path[1]) && path.length > 2 && path[2].includes('.')) {
        const filename = path[2]
        const apiUrl = `${baseUrl}/api/uuid/${filename}`;
        return handleApiRedirect(apiUrl);
    }
}

export const config = {
    matcher: [
        '/uuid/:uuid*',
        '/snid/:snid*',
        '/find-snid/:uuid*',
        '/search',
        '/view/:path*',
        '/iiif/:path*',
        '/status',
    ],
}

