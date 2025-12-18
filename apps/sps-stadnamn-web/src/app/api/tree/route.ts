import { treeSettings } from "@/config/server-config";
import { postQuery } from "../_utils/post";


export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm1, adm2, uuid } = Object.fromEntries(searchParams.entries())

    if (!dataset || !treeSettings[dataset]) {
        return Response.json({ error: 'INVALID_DATASET' }, { status: 400 })
    }

    // Fetch a single cadastral unit doc by uuid (used by tree UI + map overlay).
    // Important: do NOT use `/api/doc` here; keep this within the dedicated tree API.
    if (uuid) {
        const query = {
            size: 1,
            terminate_after: 1,
            track_scores: false,
            query: { term: { uuid } },
            _source: true
        }

        const [data, status] = await postQuery(dataset, query)
        return Response.json(data, { status })
    }

    const settings = treeSettings[dataset]

    // Cadastral units (gård) are docs of their own. Subunits (bruk) have `within` pointing to the parent.
    // For tree navigation we list ONLY cadastral units, so we can use their own `uuid`, `location`, etc.
    const query = {
        size: 10000,
        track_scores: false,
        query: {
            bool: {
                must: [
                    { bool: { must_not: [{ exists: { field: "within" } }] } },
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ],
                ...(settings.filter ? { filter: [settings.filter] } : {})
            }
        },
        sort: adm2 ?
            settings.sort.map(field => {
                const [parent, child] = field.split("__");
                // If the field contains __, it's nested
                if (child) {
                    return {
                        [`${parent}.${child}`]: {
                            order: "asc",
                            nested: {
                                path: parent
                            }
                        }
                    };
                }
                // If not nested, use simple sort
                return {
                    [field]: { order: "asc" }
                };
            }) :
            [{
                [settings.aggSort]: { order: "asc" }
            }],
        fields: [
            "uuid",
            "label",
            "location",
            "adm1",
            "adm2",
            "group.id",
            settings.parentName,
            settings.subunit.replace("__", "."),
            settings.aggSort
        ],
        ...(adm2 ? {} : {
            collapse: {
                field: adm1 ? "adm2.keyword" : "adm1.keyword"
            },
        }),
        _source: false
    }

    const [data, status] = await postQuery(dataset, query)

    return Response.json(data, { status: status })
}


