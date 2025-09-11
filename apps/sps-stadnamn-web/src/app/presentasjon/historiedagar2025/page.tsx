'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TOTAL_PAGES = 3

export default function OverviewPage() {
    const router = useRouter()

    useEffect(() => {
        // Store current path for navbar (overview is slide 0)
        localStorage.setItem('lastPresentationPage', '/presentasjon/historiedagar2025')

        // Set up keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                router.push('/presentasjon/historiedagar2025/1')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router])

    return (
        <div className="flex flex-col relative">
            {/* Progress bar */}
            <div className="fixed flex-grow top-0 left-0 right-0 h-1 bg-gray-200 z-[60]">
                <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: '0%' }}
                />
            </div>

            {/* Navigation controls */}
            <div className="fixed right-12 bottom-32 flex gap-2 bg-black/10 backdrop-blur-sm p-2 rounded-lg z-[60]">
                <span className="p-2">
                    0 / {TOTAL_PAGES}
                </span>
                <button
                    onClick={() => router.push('/presentasjon/historiedagar2025/1')}
                    className="p-2 rounded hover:bg-black/20"
                >
                    →
                </button>
            </div>

            {/* Main content */}
            <div className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full flex items-center justify-center min-h-[60vh] md:min-h-[70vh]">
                <article className="prose-presentation">
                    <div className="flex flex-col text-center items-center">
                        <h1>Stadnamnportalen</h1>
                        <p>En karttjeneste for stedsnavnarkiver, matrikler og folketellinger</p>
                    </div>
                </article>
            </div>
        </div>
    )
}
