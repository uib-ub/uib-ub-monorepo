import type { NextRequest } from 'next/server'
import { fetchDoc, fetchSNID, fetchSNIDParent } from './app/api/_utils/actions'
import { defaultDoc2jsonld, doc2jsonld } from './config/rdf-config'
import { datasetTitles } from './config/metadata-config'

const baseUrl = process.env.VERCEL_ENV === 'production' ? 'https://stadnamnportalen.uib.no' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'


export async function middleware(request: NextRequest) {
    // Extract uuid and extension from url
    
    const url = new URL(request.url)
    const path = url.pathname.split('/')



    if (path[1] == 'search') {
        const dataset = url.searchParams.get('dataset') || 'search'

        if (!datasetTitles[dataset]) {
                return Response.redirect(baseUrl + "/search", 302)
        }
        return

    }

    if (path[1] == 'view') {
        const searchParams = new URLSearchParams(url.searchParams)
        const dataset = path[2]
        if (path.length == 5 && path[3] == 'doc') {
            return Response.redirect(baseUrl + "/uuid/" + path[4], 302)
        }
        if (path.length == 5 && path[3] == 'iiif') {
            return Response.redirect(baseUrl + "/iiif/" + path[4], 302)
        }
        if (dataset != 'search') {
            searchParams.set('dataset', dataset)
        }
        return Response.redirect(baseUrl + "/search?" + searchParams.toString() , 302)
    }
    
    if (path[1] == 'snid') {
        // redirect
        const snid = path[2]
        const data = await fetchSNID(snid);
        return Response.redirect(baseUrl + "/uuid/" + data.fields.uuid, 302);
    }

    if (path[1] == 'find-snid') {
        // redirect
        const uuid = path[2]
        const data = await fetchSNIDParent(uuid);
        return Response.redirect(baseUrl + "/uuid/" + data.fields.uuid, 302);
    }

    if (["uuid", "iiif"].includes(path[1]) && path.length > 2 && path[2].includes('.')) {
        const filename = path[2]
        
        const apiUrl = `${baseUrl}/api/uuid/${filename}`;
        console.log("API URL", apiUrl)
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            return new Response('Not found', { status: 404 });
        }        
        const data = await response.json();
        return Response.json(data);
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
    ],
    
  }

