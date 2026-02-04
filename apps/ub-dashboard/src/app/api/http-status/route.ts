import { NextResponse } from 'next/server';

const REQUEST_TIMEOUT_MS = 10000;

const formatStatus = (status: number, statusText: string) => {
  const trimmed = statusText?.trim();
  return trimmed ? `${status} ${trimmed}` : String(status);
};

const isHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const fetchWithTimeout = async (url: string, init: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url')?.trim() || '';

  if (!url || !isHttpUrl(url)) {
    return NextResponse.json(
      { status: 'Invalid URL', ok: false },
      { status: 200 }
    );
  }

  try {
    let response = await fetchWithTimeout(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      response = await fetchWithTimeout(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
      });
    }

    return NextResponse.json(
      {
        status: formatStatus(response.status, response.statusText),
        ok: response.ok,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'Error', ok: false },
      { status: 200 }
    );
  }
}
