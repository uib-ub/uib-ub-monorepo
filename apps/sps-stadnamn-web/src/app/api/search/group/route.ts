export const runtime = 'edge'

import { base64UrlToString } from '@/lib/utils';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const group = searchParams.get('group');
  const fuzzy = parseInt(searchParams.get('fuzzy') || '0')
  let [groupType, groupId, groupLabel] = base64UrlToString(group || '').split('_') || []
  groupLabel = decodeURIComponent(groupLabel)

  if (!groupType || !groupId || !groupLabel) {
    return Response.json({ error: `Missing required parameters: ${group} ${groupType} ${groupId} ${groupLabel}` }, { status: 400 });
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
                ...(fuzzy > 0 && { fuzziness: fuzzy }),
                operator: "or"
              }
            }
          }
        ]
      }
    }
  };
  
  // Fuzzy matches grouped by label
  /*
  const query = {
    size: 100,
    _source: false,
    fields: ['label', 'gnidu', 'uuid'],
    collapse: {
      field: "label.keyword",
      inner_hits: {
        name: "label",
        size: 5,
      }
    },
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
  }
  */

  console.log(query)

  const [data, status] = await postQuery('all', query);
  return Response.json(data, { status });
}