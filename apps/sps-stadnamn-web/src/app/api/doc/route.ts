export const runtime = 'edge'
export async function GET(request: Request) {
    const doc = new URLSearchParams(new URL(request.url).search).get('doc');
    let dataset = new URLSearchParams(new URL(request.url).search).get('dataset');
    const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_doc/${doc}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
        }
    })
  const data = await res.json()
  return Response.json(data);
}