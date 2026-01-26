import type { NextRequest } from 'next/server'
import { datasetTitles } from './config/metadata-config'

function getBaseUrlFromRequest(request: NextRequest): string {
    // Prefer the absolute request URL origin; this avoids any env var dependency
    try {
        const { origin } = new URL(request.url)
        if (origin) return origin
    } catch { }
    // Fallback to forwarded headers if origin parsing ever fails
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    if (host) return `${proto}://${host}`
    // Last-resort default
    return 'http://stadnamn.no'
}

// Generic function to handle API calls with redirect or not found
async function handleApiRedirect(apiUrl: string, baseUrl: string, redirectPathFn?: (data: any) => string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        // Keep this Edge-safe: proxy fetch does not support Next's route-handler cache tags.
        const response = await fetch(apiUrl, { signal: controller.signal, cache: 'force-cache' });
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

export async function proxy(request: NextRequest) {
    const url = new URL(request.url)
    const path = url.pathname.split('/')
    const baseUrl = getBaseUrlFromRequest(request)


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


    if (path[1] == 'iiif' && path.length == 4) {
        const iiifRoute = path[2]
        const idOrIndex = path[3]
        // Redirect canvas, annotationPage, annotation to manifest
        if (["canvas", "annotationPage", "annotation"].includes(iiifRoute)) {
            const lookupUrl = `${baseUrl}/api/iiif/redirect-suppage?suppageType=${encodeURIComponent(iiifRoute)}&suppageId=${encodeURIComponent(idOrIndex)}`
            const res = await fetch(lookupUrl, { cache: 'force-cache' })
            if (!res.ok) return new Response('Not found', { status: 404 })
            const data = await res.json()
            if (data?.uuid) {
                return Response.redirect(baseUrl + `/iiif/manifest/${data.uuid}`, 302)
            }
            return new Response('Not found', { status: 404 })
        }
    }

    if (path[1] == 'view') {
        
        const dataset = path[2]
        if (path.length == 5 && path[3] == 'doc') {
            return Response.redirect(baseUrl + "/uuid/" + path[4].slice(0, 36), 302)
        }
        if (path.length == 5 && path[3] == 'iiif') {
            return Response.redirect(baseUrl + "/iiif/" + path[4].slice(0, 36), 302)
        }

        const newSearchParams = new URLSearchParams()

        const searchParams = new URLSearchParams(url.search)
        if (searchParams.get('q')) {
            newSearchParams.set('q', searchParams.get('q')!)
        }
        searchParams.set('dataset', dataset)

        return Response.redirect(baseUrl + "/search?" + newSearchParams.toString(), 302)
    }

    if (path[1] == 'snid') {
        const snid = path[2]
        //const apiUrl = `${baseUrl}/api/snid?snid=${snid}`;
        const apiUrl = `${baseUrl}/search?snid=${snid}`;
        return Response.redirect(apiUrl, 302)
        //return handleApiRedirect(apiUrl, baseUrl, (data) => "/uuid/" + data.hits.hits[0].fields.uuid[0]);
    }

    if (path[1] == 'find-snid') {
        const uuid = path[2]
        const apiUrl = `${baseUrl}/api/snid?uuid=${uuid}`;
        return handleApiRedirect(apiUrl, baseUrl, (data) => "/uuid/" + data.hits.hits[0].fields.uuid[0]);
    }

    if (["uuid", "iiif"].includes(path[1]) && path.length > 2 && path[2].includes('.')) {
        const filename = path[2]
        const apiUrl = `${baseUrl}/api/uuid/${filename}`;
        return handleApiRedirect(apiUrl, baseUrl);
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


