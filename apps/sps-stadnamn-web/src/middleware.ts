

import type { NextRequest } from 'next/server'
import { fetchDoc } from './app/api/_utils/actions'
export async function middleware(request: NextRequest) {
    // Extract uuid and extension from url
    const url = new URL(request.url)
    const dataset = url.pathname.split('/')[2]
    const suffix = url.pathname.split('/')[4]
    const [uuid, extension] = suffix.split('.')


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
        const jsonld = {
            "@context": {
                "@vocab": "http://www.cidoc-crm.org/cidoc-crm/",
                "label": "P1_is_identified_by",
                "location": "P168_place_is_defined_by",
                "placeName": "P87_is_identified_by",
                "document": "P70_documents"
            },
            "@id": data._source.uuid,
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
                        "coordinates": data._source.location.coordinates
                    }
                }
            }
        }
        return Response.json(jsonld);

    }
    else {
        return Response.json(data);
    }
    
}

  export const config = {
    matcher: [
        '/view/:dataset/doc/:uuid*.json',
        '/view/:dataset/doc/:uuid*.geojson',
        '/view/:dataset/doc/:uuid*.jsonld',
    ],
    
  }

