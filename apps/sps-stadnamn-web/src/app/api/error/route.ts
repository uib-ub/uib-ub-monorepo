

export async function POST(request: Request) {
  try {
    const { message, stack, code, digest, node_env, url } = await request.json();

    // For now, just log to console. (In production, you might store this elsewhere.)
    console.error('API Error Report:', {
      message,
      stack,
      digest,
      node_env,
      url,
      code,
      reportedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({ status: 'ok', received: { message, stack, code } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'error', error: (error as Error).message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}