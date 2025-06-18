export const runtime = 'edge'

import { base64UrlToString } from '@/lib/utils';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const expanded = searchParams.get('expanded');
  let [groupType, groupId, groupLabel] = base64UrlToString(expanded || '').split('-') || []
  groupLabel = decodeURIComponent(groupLabel)

  if (!groupType || !groupId || !groupLabel) {
    return Response.json({ error: `Missing required parameters: ${expanded} ${groupType} ${groupId} ${groupLabel}` }, { status: 400 });
  }

  console.log(groupType, groupId, groupLabel)

  // Build the query
  const query = {
    size: 100,
    _source: false,
    fields: ['label', 'gnidu', 'h3'],
    query: {
      bool: {
        must: [
          { term: { [groupType + ".keyword"]: groupId } },
          {
            match: {
              label: {
                query: groupLabel,
                fuzziness: 2,
                operator: "or"
              }
            }
          }
        ]
      }
    }
  };

  console.log(query)

  const [data, status] = await postQuery('all', query);
  return Response.json(data, { status });
}