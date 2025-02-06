'use client' // Error boundaries must be Client Components
 
import ErrorMessage from '@/components/error-message'
import { usePlausible } from 'next-plausible'
import { useEffect, useState } from 'react'
import { PiWarningCircle, PiWarningFill, PiSpinner, PiArrowClockwise, PiBugBeetle, PiCheckCircle } from 'react-icons/pi'
 
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
    plausible('error', {
      props: {
        message: error.message,
        stack: error.stack,
        digest: error.digest
      }
    })
    setIsReported(true)
  }
 
  return (
    <main className="flex-1 flex items-center justify-center p-4" >
      <div role="alert" aria-live="assertive" className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3">
          <PiWarningFill aria-hidden="true" className="text-primary-600 text-2xl" />
          <h2 className="text-xl font-serif">Det har oppstått en feil</h2>
        </div>

        <div className="space-y-4">
          <div className="inner-slate p-4 rounded-md">
            <p className="font-mono text-sm text-neutral-700 break-words">{error.message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="btn btn-outline flex-1 flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <PiSpinner className="animate-spin" aria-hidden="true" />
              ) : (
                <PiArrowClockwise aria-hidden="true" />
              )}
              {isResetting ? 'Laster...' : 'Last på nytt'}
            </button>
            <button 
              onClick={handleReport}
              disabled={isReported}
              className="btn btn-outline flex-1 flex items-center justify-center gap-2"
            >
              {isReported ? (
                <PiCheckCircle aria-hidden="true" />
              ) : (
                <PiBugBeetle aria-hidden="true" />
              )}
              {isReported ? 'Rapportert' : 'Rapporter'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}