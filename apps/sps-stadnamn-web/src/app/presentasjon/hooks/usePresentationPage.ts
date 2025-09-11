'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function usePresentationPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState<string | null>(null)

  useEffect(() => {
    // Extract page from pathname if we're in a presentation
    const match = pathname.match(/\/presentasjon\/historiedagar2025\/(\d+)/)
    if (match) {
      const page = match[1]
      setCurrentPage(page)
      
      // Store in localStorage and cookie
      localStorage.setItem('presentation-page', page)
      document.cookie = `presentation-page=${page}; path=/; max-age=${24 * 60 * 60}`
    }
  }, [pathname])

  const goToLastPresentationPage = useCallback(() => {
    if (currentPage) {
      router.push(`/presentasjon/historiedagar2025/${currentPage}`)
    } else {
      // Try to get from localStorage if not in state
      const savedPage = localStorage.getItem('presentation-page')
      if (savedPage) {
        router.push(`/presentasjon/historiedagar2025/${savedPage}`)
      } else {
        router.push('/presentasjon/historiedagar2025')
      }
    }
  }, [currentPage, router])

  return {
    currentPage,
    goToLastPresentationPage
  }
}