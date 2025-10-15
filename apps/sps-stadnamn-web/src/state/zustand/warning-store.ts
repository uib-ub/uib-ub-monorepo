import { create } from 'zustand'

type DismissedMessages = {
  dismissedMessages: Set<string>  
  shownMessages: Set<string>
  dismissMessage: (messageId: string) => void
  allowMessage: (messageId: string) => boolean
  markShown: (messageId: string) => void
  resetDismissedMessages: () => void
}

// Minimal manual persistence without middleware
const STORAGE_KEY = 'dismissed-messages'

function readDismissedFromStorage(): Set<string> {
  try {
    if (typeof window === 'undefined') return new Set<string>()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set<string>()
    const parsed = JSON.parse(raw)
    return new Set<string>(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set<string>()
  }
}

function writeDismissedToStorage(dismissed: Set<string>): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(dismissed)))
  } catch {
    // ignore storage errors
  }
}

export const useWarningStore = create<DismissedMessages>()((set, get) => ({
  dismissedMessages: readDismissedFromStorage(),
  shownMessages: new Set<string>(),
  markShown: (messageId: string) =>
    set((state) => ({
      shownMessages: new Set([...state.shownMessages, messageId])
    })),
  dismissMessage: (messageId: string) =>
    set((state) => {
      const next = new Set<string>([...state.dismissedMessages, messageId])
      writeDismissedToStorage(next)
      return { dismissedMessages: next }
    }),
  
  allowMessage: (messageId: string) => {
    if (get().shownMessages.has(messageId)) {
      return false
    }
    if (get().dismissedMessages.has(messageId)) {
      return false
    }
    return true
  },
  
  resetDismissedMessages: () => {
    writeDismissedToStorage(new Set<string>())
    set({ dismissedMessages: new Set<string>() })
  }
}))

