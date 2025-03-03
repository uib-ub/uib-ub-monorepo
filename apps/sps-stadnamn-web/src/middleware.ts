

import type { NextRequest } from 'next/server'
import { fetchChildren, fetchDoc, fetchSNID } from './app/api/_utils/actions'
import { defaultDoc2jsonld, doc2jsonld } from './config/rdf-config'
import { datasetTitles } from './config/metadata-config'



export async function middleware(request: NextRequest) {
    // Extract uuid and extension from url
    
    const url = new URL(request.url)
    const path = url.pathname.split('/')



    if (path[1] == 'search') {
        const dataset = url.searchParams.get('dataset') || 'search'

        if (!datasetTitles[dataset]) {
                return Response.redirect("http:localhost:3000/search", 302)
        }

    }

    if (path[1] == 'view') {
        const searchParams = new URLSearchParams(url.searchParams)
        const dataset = path[2]
        if (path.length == 5 && path[3] == 'doc') {
            return Response.redirect("http:localhost:3000/uuid/" + path[4], 302)
        }
        if (path.length == 5 && path[3] == 'iiif') {
            return Response.redirect("http:localhost:3000/iiif/" + path[4] + "/iiif", 302)
        }
        if (dataset != 'search') {
            searchParams.set('dataset', dataset)
        }
        return Response.redirect("http:localhost:3000/search?" + searchParams.toString() , 302)
    }
    
    if (path[1] == 'snid') {
        // redirect
        const snid = path[2]
        const data = await fetchSNID(snid);
        return Response.redirect(`http:localhost:3000/uuid/${data.fields.uuid}`, 302);
    }

    if (path[1] == "uuid" && path[2].includes('.')) {

        const filename = path[2]
        const [uuid, extension] = filename.split('.')
        const data = await fetchDoc({ uuid});

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
        '/search',
        '/view/:path*',
    ],
    
  }

