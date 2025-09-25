import { postQuery } from '../../_utils/post';

export async function GET() {
    try {        
        const [results, status] = await postQuery('iiif_*', {
            size: 20, // Limit to 20 items for debugging
            query: {
                bool: {
                    must_not: [
                        { exists: { field: "partOf" } }
                    ]
                }
            },
            aggs: {
                total_manifests: {
                    sum: {
                        field: "childCount.manifests"
                    }
                },
                total_images: {
                    sum: {
                        field: "childCount.images"
                    }
                },
                total_reused_images: {
                    sum: {
                        field: "childCount.reusedImages"
                    }
                },
                total_audio: {
                    sum: {
                        field: "childCount.audio"
                    }
                }
            },
            sort: [
                { "_score": { "order": "desc" } }
            ]
        }, undefined, ['all', 'iiif']);

        if (status !== 200) {
            return Response.json(
                { error: "Failed to fetch items", status }, 
                { status: 500 }
            );
        }

        const items = results?.hits?.hits?.map((hit: any) => ({
            id: hit._id,
            index: hit._index,
            source: hit._source,
            score: hit._score
        })) || [];

        return Response.json({
            total: results?.hits?.total?.value || 0,
            items,
            query_info: {
                description: "Items that do NOT have a 'partOf' field",
                index_pattern: "iiif_*",
                items_returned: items.length
            }
        });

    } catch (error) {
        console.error('Error fetching items without partOf:', error);
        return Response.json(
            { error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
