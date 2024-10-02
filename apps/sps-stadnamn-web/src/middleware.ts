

import type { NextRequest } from 'next/server'
import { fetchDoc, fetchSNID } from './app/api/_utils/actions'
export async function middleware(request: NextRequest) {
    // Extract uuid and extension from url
    
    const url = new URL(request.url)
    const path = url.pathname.split('/')
    
    if (path[1] == 'snid') {
        // redirect
        const snid = path[2]
        const data = await fetchSNID(snid);
        //return Response.json({"url": `/view/search/doc/${data.fields.uuid}`});
        return Response.redirect(`http:localhost:3000/view/search/doc/${data.fields.uuid}?expanded=${data.fields.uuid}${url.searchParams ? '&' + url.searchParams : ''}`, 302);
    }

    if (path[1] == "uuid" && path[2].includes('.')) {
        const dataset = path[1]
        const filename = path[2]
        const [uuid, extension] = filename.split('.')
        const data = await fetchDoc({ uuid, dataset});

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
            const wktPoint = `POINT(${data._source.location.coordinates.join(' ')})`;
            const jsonld = {
                "@context": {
                    "@vocab": "http://www.cidoc-crm.org/cidoc-crm/",
                    "label": "P1_is_identified_by",
                    "location": "P168_place_is_defined_by",
                    "placeName": "P87_is_identified_by",
                    "document": "P70_documents",
                    "coordinates": "http://www.opengis.net/ont/geosparql#asWKT"
                },
                "id": `https://purl.org/stadnamn/uuid/${data._source.uuid}`,
                "@type": "E31_Document",
                "document": {
                    "@id": "_:placeName",
                    "@type": "E44_Place_Appellation",
                    "label": data._source.label,
                    "placeName": {
                        "@id": "_:place",
                        "@type": "E53_Place",
                        "label": data._source.label,
                        "location": {
                            "@type": "E94_Space_Primitive",
                            "coordinates": wktPoint
                        }
                    }
                }
            }
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
    ],
    
  }

