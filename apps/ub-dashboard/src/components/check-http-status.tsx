"use client"
import { useEffect, useState } from 'react'
import { getBaseUrl } from '@/lib/utils';

export const CheckHttpStatus = ({ url }: { url: string }) => {
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchStatus = async () => {
      try {
        setIsLoading(true)
        setStatus(null)
        const res = await fetch(`${getBaseUrl()}/api/http-status?url=${encodeURIComponent(url)}`)
        const data = await res.json()

        if (!cancelled) {
          setStatus(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch HTTP status:', error)
          setStatus('Error')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchStatus()

    return () => {
      cancelled = true
    }
  }, [url])

  if (isLoading) {
    return <span>Loading...</span>
  }

  return <span>{status}</span>
}
