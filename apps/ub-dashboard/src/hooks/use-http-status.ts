import { useEffect, useState } from 'react';
import { getBaseUrl } from '@/lib/utils';

// Client-side cache to prevent duplicate requests within the same session
const clientCache = new Map<string, { data: string; timestamp: number }>();
const CLIENT_CACHE_TTL = 30000; // 30 seconds

export function useHttpStatus(url: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchStatus = async () => {
      // Check client cache first
      const cached = clientCache.get(url);
      const now = Date.now();
      if (cached && (now - cached.timestamp) < CLIENT_CACHE_TTL) {
        setStatus(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${getBaseUrl()}/api/http-status?url=${encodeURIComponent(url)}`,
          {
            signal: abortController.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setStatus(data);
        setIsLoading(false);
        setError(null);
        // Update client cache
        clientCache.set(url, { data, timestamp: now });
      } catch (err: any) {
        // Ignore abort errors (component unmounted)
        if (err.name !== 'AbortError') {
          setStatus('Error');
          setIsLoading(false);
          setError(err.message || 'Failed to fetch status');
        }
      }
    };

    fetchStatus();

    return () => {
      abortController.abort();
    };
  }, [url]);

  return { status, isLoading, error };
}
