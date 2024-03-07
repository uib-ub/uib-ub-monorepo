//export const runtime = 'edge'
export const runtime = 'edge'
export async function GET(request: Request) {
    const docs = new URLSearchParams(new URL(request.url).search).get('docs');
    let dataset = new URLSearchParams(new URL(request.url).search).get('dataset');
    if (dataset == 'search') {
      dataset = '*'
    }


    if (!docs || !dataset) {
        return new Response('Missing parameter', { status: 400 });
      }

    const query = {
        query: {
            terms: {
                "uuid.keyword": docs.split(',')
            }
        }
    }

    console.log(JSON.stringify(query))

    const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  })
  const data = await res.json()
  return Response.json(data);
}