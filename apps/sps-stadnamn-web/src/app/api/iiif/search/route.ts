
//export const runtime = 'edge'

import { postQuery } from '../../_utils/post';
import { fetchIIIFSearch } from '../iiif-search';

export async function GET(request: Request) {
  
  // extract parameters from the request using standard URL parsing
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection') || '';
  const q = url.searchParams.get('q') || '';    
  const type = url.searchParams.get('type') || '';
  const size = url.searchParams.get('size') || '20';

  const {response, status} = await fetchIIIFSearch(collection, q, type, parseInt(size));

  return Response.json(response, {status: status})
}