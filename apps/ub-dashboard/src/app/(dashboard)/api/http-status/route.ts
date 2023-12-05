export const dynamic = 'force-dynamic' // defaults to force-static

const fetchData = async (url: string): Promise<string | number> => {
  try {
    const response = await fetch(url, { method: 'GET', next: { revalidate: 60 } })
    if (!response) {
      return "Fuck up"
    }
    if (response.status === 301) {
      return 'Moved permanently'
    }
    if (response.status === 400) {
      return 'Bad request'
    }
    if (response.status === 401) {
      return 'Restricted'
    }
    if (response.status === 404) {
      return 'Unavailable'
    }
    if (response.status === 200) {
      return 'Ok'
    }
    return response.status
  } catch (error: any) {
    if ('cause' in error) {
      return error.cause.code;
    }
    return 'Error';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (url === null) {
    // Return an error response or a default value
    return 'URL parameter is missing'
  }
  const data = await fetchData(url)
  return Response.json(data)
}