"use client"
import { getBaseUrl } from '@/lib/utils'

export const CheckHttpStatus = async ({ url }: { url: string }) => {
  const res = await fetch(`${getBaseUrl()}/api/http-status?url=${url}`)
  const status = await res.json()

  return (
    <span>{status}</span>
  )
}
