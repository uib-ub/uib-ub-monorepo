
export const runtime = 'edge'
import { fieldConfig } from '@/config/search-config';
import { postQuery } from '../_utils/post';
import { treeSettings } from '@/config/server-config';

export async function GET(request: Request) {

    const url = new URL(request.url);
    const uuid = url.searchParams.get('uuid');
    const dataset = url.searchParams.get('dataset');

    // Handle missing parameters
    if (!uuid || !dataset) {
        return Response.json({error: "Missing parameters"}, { status: 400 });
    }

    // Check if dataset is configured in fieldConfig
    if (!fieldConfig[dataset]) {
        return Response.json({error: "Invalid dataset"}, { status: 400 });
    }

    const fields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return { key, label: value.label }
    })

    const sortFields = treeSettings[dataset].sort


    const query = {
        size: 1000,
        query: {
            term: {
                "within.keyword": uuid
            }
        },
        fields: fields,    
        sort: sortFields.map((field: string) => {
            if (field.startsWith("cadastre.")) {
                return {
                    [field]: {
                        order: "asc",
                        nested: {
                            path: field.split('.')[0] // Assuming the field is in the format "cadastre.bnr"
                        }
                    }
                };
            } else {
                return {[field]: "asc"};
            }
        }),
        _source: false

    }
    const [data, status] =  await postQuery(dataset, query)
    return Response.json(data, { status: status })

}