
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

    const { subunit, leaf } = treeSettings[dataset]

    const cadastreTableFields = Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => {
        return key
    })

    const sortFields = treeSettings[dataset].sort

    console.log("FIELDS", cadastreTableFields)


    const query = {
        size: 1000,
        query: {
            term: {
                "within.keyword": uuid
            }
        },
        fields: ["uuid", "label", subunit, leaf, ...cadastreTableFields],    
        sort: sortFields.map((field: string) => {
            if (field.includes("__")) {
                const processed_field = field.replace("__", ".")

                return {
                    [processed_field]: {
                        order: "asc",
                        nested: {
                            path: processed_field.split('.')[0] // Assuming the field is in the format "cadastre.bnr"
                        }
                    }
                };
            } else {
                return {[field]: "asc"};
            }
        }),
        _source: false

    }
    console.log("QUERY", query)
    const [data, status] =  await postQuery(dataset, query)
    return Response.json(data, { status: status })

}