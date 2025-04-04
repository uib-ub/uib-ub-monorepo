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
        const [uuid, extension] = filename.split('.')
        const data = await fetchDoc({ uuid });

        if (extension == 'geojson') {
            const geojson = {
                "type": "Feature",
                "geometry": data._source.location,
                "properties": {
                    "id": data._source.uuid,
                    "label": data._source.label,
                    "rawData": data._source.rawData,
                    "adm1": data._source.adm1,
                    "adm2": data._source.adm2,
                    "audio": data._source.audio
                }
            }
            return Response.json(geojson);
        }

        if (extension == 'jsonld') {
            const docDataset = data._index.split('-')[2]
            let children
            if (data._source?.children?.length > 0) {
                console.log("CHILDREN_1", data._source.children)
                children = await fetchDoc({ uuid: data._source.children})
                console.log("CHILDREN_2", children)
            }

            console.log("CHILDREN_3", children)


            const jsonld = doc2jsonld[docDataset as keyof typeof doc2jsonld] ? doc2jsonld[docDataset as keyof typeof doc2jsonld](data._source, children) : defaultDoc2jsonld(data._source, children)

            return Response.json(jsonld);
        }
        if (extension == 'json') {
            return Response.json(data);
        }
    }
    
}


  export const config = {
    matcher: [
        '/uuid/:uuid*',
        '/snid/:snid*',
        '/find-snid/:uuid*',
        '/search',
        '/view/:path*',
    ],
    
  }

