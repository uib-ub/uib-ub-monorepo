'use client' // Error boundaries must be Client Components
 
import ErrorMessage from '@/components/error-message'
import Spinner from '@/components/svg/Spinner'
import { usePlausible } from 'next-plausible'
import { useEffect, useState } from 'react'
import { PiWarningCircle, PiWarningFill, PiSpinner, PiArrowClockwise, PiBugBeetle, PiCheckCircle, PiCheck } from 'react-icons/pi'
 
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
    <main className="flex-1 flex lg:items-center justify-center p-4 bg-white lg:bg-transparent" >
      <div role="alert" aria-live="assertive" className="w-full lg:bg-white lg:rounded-lg lg:shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3">
          <PiWarningFill aria-hidden="true" className="text-primary-600 text-2xl" />
          <h2 className="text-xl font-serif">Det har oppstått ein feil</h2>
        </div>

        <div className="space-y-4">
          <div className="inner-slate p-4 rounded-md">
            <p className="font-mono text-sm text-neutral-700 break-words" lang="en">{error.message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="btn btn-outline flex-1 flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <Spinner status="Laster" className="animate-spin" aria-hidden="true" />
              ) : (
                <PiArrowClockwise aria-hidden="true" />
              )}
                Last på nytt

            </button>
            <button 
              onClick={handleReport}
              disabled={isReported}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isReported && <PiCheck aria-hidden="true" />}
              Rapporter
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}