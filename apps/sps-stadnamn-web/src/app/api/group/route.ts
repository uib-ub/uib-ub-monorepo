export const runtime = 'edge'

import { postQuery } from '../_utils/post';
import { base64UrlToString } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base64group = searchParams.get('base64');
  const size = parseInt(searchParams.get('size') || '1000')

  const group = base64UrlToString(base64group || '')
  if (!base64group) {
    return Response.json({ error: 'base64 parameter is required' }, { status: 400 });
  }

  


  // Build the query
  
  const query = {
    size: size,
    _source: false,
    fields: ['uuid', 'label', 'gnidu', 'h3', 'group'],
    sort: [
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      }
    ],
    query: {
      term: { group},
    }
  };
  

  const [data, status] = await postQuery('all', query);
  return Response.json(data, { status });
}