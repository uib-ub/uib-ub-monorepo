/**
 * One-off setup script that creates the Elasticsearch index used by both
 * `link-shortener` and `ub-dashboard` if it doesn't already exist.
 *
 * Usage:
 *   ES_HOST=... ES_APIKEY=... ES_INDEX=... npx tsx scripts/setup-index.ts
 */
import { Client, HttpConnection } from '@elastic/elasticsearch';

const node = process.env.ES_HOST;
const apiKey = process.env.ES_APIKEY;
const index = process.env.ES_INDEX;

if (!node || !apiKey || !index) {
  console.error('Missing required env: ES_HOST, ES_APIKEY, ES_INDEX');
  process.exit(1);
}

async function main(esIndex: string) {
  const client = new Client({
    node,
    auth: { apiKey: apiKey! },
    Connection: HttpConnection,
  });

  const exists = await client.indices.exists({ index: esIndex });
  if (exists) {
    console.log(`Index "${esIndex}" already exists. Nothing to do.`);
    return;
  }

  await client.indices.create({
    index: esIndex,
    mappings: {
      dynamic: 'strict',
      properties: {
        path: { type: 'keyword' },
        originalURL: { type: 'keyword' },
        qr: { type: 'text', index: false },
        domain: { type: 'keyword' },
        title: {
          type: 'text',
          fields: { keyword: { type: 'keyword', ignore_above: 256 } },
        },
        tags: { type: 'keyword' },
        views: { type: 'integer' },
        redirectType: { type: 'short' },
        created: { type: 'date' },
        modified: { type: 'date' },
        expiresAt: { type: 'date' },
        expiresURL: { type: 'keyword' },
        utmSource: { type: 'keyword' },
        utmMedium: { type: 'keyword' },
        utmCampaign: { type: 'keyword' },
        utmTerm: { type: 'keyword' },
        utmContent: { type: 'keyword' },
      },
    },
  });

  console.log(`Created index "${esIndex}".`);
}

main(index).catch((err) => {
  console.error('Failed to set up index', err);
  process.exit(1);
});
