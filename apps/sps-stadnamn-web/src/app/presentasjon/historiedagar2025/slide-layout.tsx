'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TOTAL_PAGES = 5

interface SlideLayoutProps {
  children: React.ReactNode
  slideNumber: number
}

export default function SlideLayout({ children, slideNumber }: SlideLayoutProps) {
  const router = useRouter()

  useEffect(() => {
    // Set up keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (slideNumber > 1) {
          router.push(`/presentasjon/historiedagar2025/${slideNumber - 1}`)
        } else {
          router.push('/presentasjon/historiedagar2025')
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (slideNumber < TOTAL_PAGES) {
          router.push(`/presentasjon/historiedagar2025/${slideNumber + 1}`)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slideNumber, router])

  return (
    <div className="flex flex-col relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(slideNumber / (TOTAL_PAGES + 1)) * 100}%` }}
        />
      </div>

      {/* Navigation controls */}
      <div className="fixed right-12 bottom-32 flex gap-2 bg-black/10 backdrop-blur-sm p-2 rounded-lg z-[60]">
        <button
          onClick={() => {
            if (slideNumber > 1) {
              router.push(`/presentasjon/historiedagar2025/${slideNumber - 1}`)
            } else {
              router.push('/presentasjon/historiedagar2025')
            }
          }}
          className="p-2 rounded hover:bg-black/20"
        >
          ←
        </button>
        <span className="p-2">
          {slideNumber} / {TOTAL_PAGES}
        </span>
        <button
          onClick={() => slideNumber < TOTAL_PAGES && router.push(`/presentasjon/historiedagar2025/${slideNumber + 1}`)}
          className="p-2 rounded hover:bg-black/20 disabled:opacity-50"
          disabled={slideNumber >= TOTAL_PAGES}
        >
          →
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-32 w-full">
        <div className="transition-opacity duration-300">
          <article className="prose-presentation">
            {children}
          </article>
        </div>
      </div>

      {/* Footer */}

    </div>
  )
}
