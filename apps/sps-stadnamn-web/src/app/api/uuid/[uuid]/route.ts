import { fetchDoc } from '@/app/api/_utils/actions';
import { defaultDoc2jsonld, doc2jsonld } from '@/config/rdf-config';

//export const runtime = 'edge';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        // Await params before using its properties
        const { uuid } = await params;
        
        // Extract UUID and extension from the params.uuid
        let actualUuid = uuid;
        let extension = 'json'; // default
        
        if (uuid.includes('.')) {
            const [uuidPart, extPart] = uuid.split('.');
            actualUuid = uuidPart;
            extension = extPart;
        }
        
        const data = await fetchDoc({ uuid: actualUuid });
        
        // Check if data is undefined or has an error
        if (!data) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }
        
        if (data.error) {
            return Response.json({ error: data.error }, { status: 404 });
        }

        switch (extension) {
            case 'geojson':
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
                };
                return Response.json(geojson);
                
            case 'jsonld':
                const docDataset = data._index.split('-')[2];
                let children = null;
                
                if (data._source?.children?.length > 0) {
                    children = await fetchDoc({ uuid: data._source.children });
                }

                const jsonld = doc2jsonld[docDataset as keyof typeof doc2jsonld] 
                    ? doc2jsonld[docDataset as keyof typeof doc2jsonld](data._source, children) 
                    : defaultDoc2jsonld(data._source, children);
                    
                return Response.json(jsonld);
                
            case 'json':
            default:
                return Response.json(data);
        }
        
    } catch (error) {
        console.error('Error in uuid API route:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
