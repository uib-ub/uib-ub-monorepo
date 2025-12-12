"use client"
import { useHttpStatus } from '@/hooks/use-http-status';

export const CheckHttpStatus = ({ url }: { url: string }) => {
  const { status, isLoading } = useHttpStatus(url);

  if (isLoading) {
    return <span>...</span>;
  }

  return <span>{status}</span>;
}
