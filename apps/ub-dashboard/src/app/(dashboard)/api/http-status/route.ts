export const revalidate = 60 // Revalidate every 60 seconds

// In-memory cache to prevent duplicate requests
const requestCache = new Map<string, { data: string | number; timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds

const getStatusMessage = (status: number): string => {
  const statusMap: Record<number, string> = {
    200: 'Ok',
    301: 'Moved permanently',
    400: 'Bad request',
    401: 'Restricted',
    404: 'Unavailable',
  }
  return statusMap[status] || String(status)
}

const getErrorMessage = (error: any): string => {
  // Handle timeout errors
  if (error.name === 'AbortError' ||
    error.message?.includes('timeout') ||
    error.message?.includes('Timeout') ||
    error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    error.cause?.code === 'ETIMEDOUT') {
    return 'Timeout'
  }

  // Handle connection errors
  if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'ECONNREFUSED') {
    return 'Unreachable'
  }

  if (error.message?.includes('fetch failed')) {
    return 'Connection failed'
  }

  return error.cause?.code || 'Error'
}

const fetchData = async (url: string): Promise<string | number> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      next: { revalidate: 60 }
    })

    clearTimeout(timeoutId)

    if (!response) {
      return 'No response'
    }

    return getStatusMessage(response.status)
  } catch (error: any) {
    clearTimeout(timeoutId)
    return getErrorMessage(error)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (url === null) {
    // Return an error response or a default value
    return Response.json('URL parameter is missing')
  }

  // Check cache first
  const cached = requestCache.get(url)
  const now = Date.now()
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return Response.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  }

  // Fetch fresh data
  const data = await fetchData(url)

  // Update cache
  requestCache.set(url, { data, timestamp: now })

  // Clean up old cache entries periodically
  if (requestCache.size > 100) {
    for (const [key, value] of requestCache.entries()) {
      if ((now - value.timestamp) > CACHE_TTL) {
        requestCache.delete(key)
      }
    }
  }

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}