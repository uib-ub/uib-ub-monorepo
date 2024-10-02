
export const runtime = 'edge'
import { postQuery } from '../_utils/post';

export async function GET(request: Request) {

    const url = new URL(request.url);
    const sortFields = url.searchParams.get('sortFields')?.split(',');
    const uuid = url.searchParams.get('uuid');
    const dataset = url.searchParams.get('dataset');
    const fields = url.searchParams.get('fields')?.split(',');

    // Handle missing parameters
    if (!uuid || !dataset || !fields || !sortFields) {
        return new Response("Missing parameters", { status: 400 });
    }

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
    const data =  await postQuery(dataset, query)
    return Response.json(data)

}