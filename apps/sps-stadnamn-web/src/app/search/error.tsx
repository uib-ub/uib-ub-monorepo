'use client' // Error boundaries must be Client Components
import Spinner from '@/components/svg/Spinner'
import { usePlausible } from 'next-plausible'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PiArrowClockwise, PiCheck } from 'react-icons/pi'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isResetting, setIsResetting] = useState(false)
  const [isReported, setIsReported] = useState(false)
  const plausible = usePlausible()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  const handleReset = async () => {
    setIsResetting(true)
    // Add a delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000))
    reset()
  }

  const handleReport = () => {
    const props = {
        message: error.message,
        stack: error.stack,
        digest: error.digest
    }
    plausible('error', {props})
    setIsReported(true)
  }
 
  return (
    <main className="flex-1 flex lg:items-center justify-center p-4 bg-neutral-50 pt-14" >
      <div role="alert" aria-live="assertive" className="w-full max-w-xl lg:rounded-lg p-8 space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-serif">Det har oppstått ein feil</h2>
        </div>

        <div className="space-y-4">
          {(process.env.NODE_ENV === 'development' || process.env.SN_ENV === 'dev') && <div className="inner-slate bg-white p-4 rounded-md">
             Showing stack trace in development or preview environment
            <p className="font-mono text-sm text-neutral-700 break-words" lang="en">{error?.message}</p>
            <pre>
              {JSON.stringify(error?.stack, null, 2)}
            </pre>
          </div>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="btn flex-1 flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <Spinner status="Laster" className="animate-spin" aria-hidden="true" />
              ) : (
                <PiArrowClockwise aria-hidden="true" />
              )}
                Last sida på nytt

            </button>
            <Link href="https://skjemaker.app.uib.no/view.php?id=16665712" target="_blank" rel="noopener" className="btn text-white flex-1 flex items-center justify-center gap-2"
              onClick={handleReport}
            >  
            Rapporter
            </Link>

          </div>
        </div>
      </div>
    </main>
  )
}