import { ReactNode } from 'react'
import { create } from 'zustand'

export type NotificationItem = {
  id: string
  message: ReactNode
  permanentDismiss?: boolean
  variant?: 'info' | 'warning' | 'error' | 'tooltip'
}

type NotificationStore = {
  dismissedMessages: Set<string>
  notifications: NotificationItem[]
  dismissMessage: (messageId: string) => void
  dismissNotification: (id: string, permanentDismiss?: boolean) => void
  allowMessage: (messageId: string) => boolean
  resetDismissedMessages: () => void
  addNotification: (notification: NotificationItem) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

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

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  dismissedMessages: readDismissedFromStorage(),
  notifications: [],

  dismissMessage: (messageId: string) =>
    set((state) => {
      const next = new Set<string>([...state.dismissedMessages, messageId])
      writeDismissedToStorage(next)
      return { dismissedMessages: next }
    }),

  dismissNotification: (id: string, permanentDismiss = false) =>
    set((state) => {
      const nextDismissed = permanentDismiss
        ? new Set<string>([...state.dismissedMessages, id])
        : state.dismissedMessages

      if (permanentDismiss) {
        writeDismissedToStorage(nextDismissed)
      }

      return {
        dismissedMessages: nextDismissed,
        notifications: state.notifications.filter((item) => item.id !== id)
      }
    }),

  allowMessage: (messageId: string) => {
    return !get().dismissedMessages.has(messageId)
  },

  resetDismissedMessages: () => {
    writeDismissedToStorage(new Set<string>())
    set({ dismissedMessages: new Set<string>() })
  },

  addNotification: (notification: NotificationItem) =>
    set((state) => {
      const permanentDismiss = notification.permanentDismiss ?? false
      if (permanentDismiss && !get().allowMessage(notification.id)) {
        return state
      }
      const nextNotification = { ...notification, permanentDismiss }
      const existingIndex = state.notifications.findIndex((item) => item.id === notification.id)
      if (existingIndex >= 0) {
        const next = state.notifications.filter((item) => item.id !== notification.id)
        next.unshift(nextNotification)
        return { notifications: next }
      }
      return { notifications: [nextNotification, ...state.notifications] }
    }),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id)
    })),

  clearNotifications: () => set({ notifications: [] })
}))
