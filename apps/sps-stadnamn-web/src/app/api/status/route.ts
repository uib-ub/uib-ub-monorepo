
export async function GET() {
    const endpoint = process.env.STADNAMN_ES_ENDPOINT
    const token = process.env.STADNAMN_ES_TOKEN

    if (!endpoint || !token) {
        return new Response(
            JSON.stringify({ error: 'Missing required environment variables' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    try {
        // Get alias information
        const aliasResponse = await fetch(`${endpoint}search-stadnamn-*/_alias`, {
            cache: 'force-cache',
            next: {
                tags: ["all"]
            },
            headers: {
                'Authorization': `ApiKey ${token}`,
                'Content-Type': 'application/json'
            }
        });


        // Get stats information
        const statsResponse = await fetch(`${endpoint}search-stadnamn-*/_stats`, {
            cache: 'force-cache',
            next: {
                tags: ["all"]
            },
            headers: {
                'Authorization': `ApiKey ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!aliasResponse.ok) {
            const error = await aliasResponse.json();
            throw new Error(error.error?.reason || 'Failed to fetch alias information');
        }

        if (!statsResponse.ok) {
            const error = await statsResponse.json();
            throw new Error(error.error?.reason || 'Failed to fetch stats information');
        }

        const aliasResult = await aliasResponse.json();
        const statsResult = await statsResponse.json();


        // Get individual counts for each index
        const indices = await Promise.all(
            Object.entries(aliasResult).map(async ([indexName, indexInfo]: [string, any]) => {
                // Get count for this specific index
                const indexCountResponse = await fetch(`${endpoint}${indexName}/_count`, {
                    cache: 'force-cache',
                    next: {
                        tags: ["all"]
                    },
                    headers: {
                        'Authorization': `ApiKey ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                let docCount = 0;
                if (indexCountResponse.ok) {
                    const indexCountResult = await indexCountResponse.json();
                    docCount = indexCountResult.count || 0;
                }

                const indexStats = statsResult.indices[indexName];

                // Extract creation date from stats or fetch from settings if not available
                let creationDate = null;
                if (indexStats?.primaries?.store?.creation_date) {
                    creationDate = new Date(parseInt(indexStats.primaries.store.creation_date)).toISOString();
                }

                return {
                    index: indexName,
                    aliases: Object.keys(indexInfo.aliases || {}),
                    doc_count: docCount,
                    size_in_bytes: indexStats?.total?.store?.size_in_bytes || 0,
                    creation_date: creationDate,
                    status: indexStats?.health
                };
            })
        );

        return new Response(
            JSON.stringify({ indices }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                error: 'Failed to fetch Elasticsearch status',
                details: error.message,
                status: 'error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}