'use client'

const PRESENTATION_PAGE_COOKIE = 'presentation-page'

export function getClientPresentationPage(): string | null {
  if (typeof window === 'undefined') return null
  
  // Try localStorage first
  const fromStorage = localStorage.getItem(PRESENTATION_PAGE_COOKIE)
  if (fromStorage) return fromStorage
  
  // Fallback to cookie
  const cookies = document.cookie.split(';')
  const cookie = cookies.find(c => c.trim().startsWith(`${PRESENTATION_PAGE_COOKIE}=`))
  return cookie ? cookie.split('=')[1] : null
}

export function setClientPresentationPage(page: string): void {
  if (typeof window === 'undefined') return
  
  // Store in localStorage
  localStorage.setItem(PRESENTATION_PAGE_COOKIE, page)
  
  // Also set as a cookie for server-side access if needed
  document.cookie = `${PRESENTATION_PAGE_COOKIE}=${page}; path=/; max-age=${24 * 60 * 60}`
}