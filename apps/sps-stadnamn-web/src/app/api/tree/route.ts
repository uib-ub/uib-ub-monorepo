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
    const gardFilter = {
        bool: {
            should: [
                { term: { "sosi.keyword": "gard" } },
                { term: { sosi: "gard" } },
                { bool: { must_not: [{ exists: { field: "within" } }] } }
            ],
            minimum_should_match: 1
        }
    }

    const query = {
        size: 10000,
        track_scores: false,
        query: {
            bool: {
                must: [
                    gardFilter,
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ],
                ...(settings.filter ? { filter: [settings.filter] } : {})
            }
        },
        sort:
            [{
                cadastralIndex: { order: "asc" }
            }],
        fields: [
            "uuid",
            "label",
            "location",
            "adm1",
            "adm2",
            "group.id",
            //"cadastralIndex", // for debugging
            "parentName",
            "knr",
            "gnr",
            "bnr",
            "mnr",
            "lnr"
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


