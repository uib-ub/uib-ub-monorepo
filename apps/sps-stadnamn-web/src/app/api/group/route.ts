export const runtime = 'edge'

import { base64UrlToString } from '@/lib/utils';
import { postQuery } from '../_utils/post';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const groupType = searchParams.get('groupType');
  const groupId = searchParams.get('groupId');
  const groupLabel = searchParams.get('groupLabel');
  const fuzzy = parseInt(searchParams.get('fuzzy') || '0')
  const size = parseInt(searchParams.get('size') || '100')

  // Build the query
  
  const query = {
    size: size,
    _source: false,
    fields: ['uuid', 'label', 'gnidu', 'h3'],
    sort: [{ "uuid": "asc" }],
    query: {
      bool: {
        must: [
          { term: { [groupType!]: groupId } },
          ...(fuzzy == 1 ? [
            {
              match: {
                label: {
                  query: groupLabel,
                  fuzziness: 1,
                  operator: "or"
                }
              }
            },
            {
              must_not: [
                { term: { "label.keyword": groupLabel } }
              ]
            }
          ] : []),
        ]
      }
    }
  };
  

  const [data, status] = await postQuery('all', query);
  return Response.json(data, { status });
}