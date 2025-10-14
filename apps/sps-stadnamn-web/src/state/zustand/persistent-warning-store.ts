import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DismissedMessages = {
  dismissedMessages: Set<string>
  dismissMessage: (messageId: string) => void
  isMessageDismissed: (messageId: string) => boolean
  resetDismissedMessages: () => void
}

export const useDismissedMessagesStore = create<DismissedMessages>()(
  persist(
    (set, get) => ({
      dismissedMessages: new Set<string>(),
      
      dismissMessage: (messageId: string) =>
        set((state) => ({
          dismissedMessages: new Set([...state.dismissedMessages, messageId])
        })),
      
      isMessageDismissed: (messageId: string) => {
        return get().dismissedMessages.has(messageId)
      },
      
      resetDismissedMessages: () =>
        set({ dismissedMessages: new Set<string>() })
    }),
    {
      name: 'dismissed-messages',
      // Reset store in development mode on each session
      onRehydrateStorage: () => (state) => {
        if (process.env.NODE_ENV === 'development' && state) {
          state.resetDismissedMessages()
        }
      }
    }
  )
)
