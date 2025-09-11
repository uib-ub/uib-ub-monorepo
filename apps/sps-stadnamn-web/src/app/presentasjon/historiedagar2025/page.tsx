'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PiPrinter } from 'react-icons/pi'

const TOTAL_PAGES = 5

// Import the MDX pages for printing
const Page1Content = () => (
    <div className="prose-presentation">
        <h1>Språksamlingene</h1>
        <ul>
            <li>Fra UiO til UiB i 2016</li>
            <li>80 tonn trailerlass med fysiske arkiver</li>
            <li>Databaser og skannet materiale</li>
        </ul>
    </div>
)

const Page2Content = () => (
    <div className="prose-presentation">
        <h1>Bakgrunn</h1>
        <p>Historia bak Stadnamnportalen og kvifor me treng den.</p>
    </div>
)

const Page3Content = () => (
    <div className="prose-presentation">
        <h1>Demonstrasjon</h1>
        <p>La oss sjå korleis Stadnamnportalen fungerer i praksis.</p>
    </div>
)

export default function OverviewPage() {
    const router = useRouter()
    const [showPrintView, setShowPrintView] = useState(false)

    useEffect(() => {
        // Set up keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showPrintView) return // Disable navigation in print view
            
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                router.push('/presentasjon/historiedagar2025/1')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router, showPrintView])

    const handlePrint = () => {
        setShowPrintView(true)
        // Small delay to ensure the view is rendered before printing
        setTimeout(() => {
            window.print()
        }, 100)
    }

    const handleClosePrint = () => {
        setShowPrintView(false)
    }

    if (showPrintView) {
        return (
            <div className="print-view">
                {/* Print styles */}
                <style jsx>{`
                    @media print {
                        .page-break {
                            page-break-before: always;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                    @media screen {
                        .print-view {
                            background: white;
                            padding: 2rem;
                        }
                        .page-content {
                            margin-bottom: 3rem;
                            padding: 2rem;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                        }
                    }
                `}</style>

                {/* Close button for screen view */}
                <div className="no-print mb-4 flex items-center gap-2">
                    <button
                        onClick={handleClosePrint}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        ← Tilbake
                    </button>
                    <button
                        onClick={handlePrint}
                        className="ml-2 px-4 flex items-center gap-2 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                        <PiPrinter className="text-2xl" aria-hidden="true"/>Skriv ut
                    </button>
                </div>

                {/* Title Page */}
                <div className="page-content">
                    <div className="prose-presentation text-center">
                        <h1>Stadnamnportalen</h1>
                        <p>En karttjeneste for stedsnavnarkiver, matrikler og folketellinger</p>
                        <p className="text-lg font-semibold mt-8">Norske historiedagar 2025</p>
                    </div>
                </div>

                {/* Page 1 */}
                <div className="page-content page-break">
                    <Page1Content />
                </div>

                {/* Page 2 */}
                <div className="page-content page-break">
                    <Page2Content />
                </div>

                {/* Page 3 */}
                <div className="page-content page-break">
                    <Page3Content />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col relative">
            {/* Progress bar */}
            <div className="fixed flex-grow top-0 left-0 right-0 h-1 bg-gray-200 z-[60]">
                <div 
                    className="h-full bg-primary-500 transition-all duration-300"
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

            {/* Print button */}
            <div className="fixed left-12 bottom-32 bg-black/10 backdrop-blur-sm p-2 rounded-lg z-[60]">
                <button
                    onClick={handlePrint}
                    className="p-2 rounded hover:bg-black/20 flex items-center gap-2 flex-nowrap"
                    title="Skriv ut sidene"
                >
                    <PiPrinter className="text-2xl" aria-hidden="true"/>Skriv ut
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
