import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import chatApi from '../api/chatApi'
import toast from 'react-hot-toast'

const createNewSession = (title = 'New Chat') => ({
  id: Date.now().toString(),
  title,
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const useChatStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      loading: false,
      selectedDocument: null,
      selectedDocuments: [], // Array for multi-doc mode
      selectedModel: 'llama-3.1-8b-instant',
      inputDraft: '',
      error: null,
      historyOpen: false,
      activeCitation: null,

      toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
      setHistoryOpen: (open) => set({ historyOpen: open }),
      
      setActiveCitation: (citation) => set({ activeCitation: citation }),
      clearActiveCitation: () => set({ activeCitation: null }),

      // Get current session's messages
      get messages() {
        const state = get()
        const session = state.sessions.find(s => s.id === state.activeSessionId)
        return session?.messages || []
      },

      getMessages: () => {
        const state = get()
        const session = state.sessions.find(s => s.id === state.activeSessionId)
        return session?.messages || []
      },

      setSelectedDocument: (doc) => set({ selectedDocument: doc }),
      
      setSelectedDocuments: (docs) => set({ selectedDocuments: docs }),
      
      toggleDocumentSelection: (doc) => set((state) => {
        const isSelected = state.selectedDocuments.some(d => d.id === doc.id)
        const updated = isSelected 
          ? state.selectedDocuments.filter(d => d.id !== doc.id)
          : [...state.selectedDocuments, doc]
        
        return { 
          selectedDocuments: updated,
          // For backward compat, set selectedDocument to null if multiple, 
          // or the single doc if only one is selected
          selectedDocument: updated.length === 1 ? updated[0] : null 
        }
      }),

      setSelectedModel: (model) => set({ selectedModel: model }),
      setInputDraft: (content) => set({ inputDraft: content }),

      // Create a new chat session
      newSession: () => {
        const session = createNewSession()
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: session.id,
        }))
        return session.id
      },

      // Switch to an existing session
      switchSession: (sessionId) => {
        set({ activeSessionId: sessionId })
      },

      // Delete a session
      deleteSession: (sessionId) => {
        set((state) => {
          const filtered = state.sessions.filter(s => s.id !== sessionId)
          const newActiveId = state.activeSessionId === sessionId
            ? (filtered[0]?.id || null)
            : state.activeSessionId
          return { sessions: filtered, activeSessionId: newActiveId }
        })
      },

      // Rename a session
      renameSession: (sessionId, newTitle) => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, title: newTitle } : s
          ),
        }))
      },

      addMessage: (message) => {
        set((state) => {
          let { activeSessionId, sessions } = state

          // Auto-create a session if none exists
          if (!activeSessionId || !sessions.find(s => s.id === activeSessionId)) {
            const newSess = createNewSession()
            sessions = [newSess, ...sessions]
            activeSessionId = newSess.id
          }

          const updatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
              const newMessages = [...s.messages, { ...message, id: Date.now() }]
              // Auto-title from first user message
              const title = s.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                : s.title
              return { ...s, messages: newMessages, title, updatedAt: new Date().toISOString() }
            }
            return s
          })

          return { sessions: updatedSessions, activeSessionId }
        })
      },

      sendMessage: async (content) => {
        if (!content.trim()) return

        const { addMessage, selectedDocument } = get()

        // Add User Message
        addMessage({ role: 'user', content })

        set({ loading: true, error: null })

        try {
          const { selectedDocuments } = get()
          const docIds = selectedDocuments.length > 0 ? selectedDocuments.map(d => d.id) : null
          
          const response = await chatApi.askQuestion(
            content, 
            selectedDocument?.id, 
            'llama-3.3-70b-versatile',
            docIds
          )
          const aiContent = response.data.answer || response.data.response
          const sources = response.data.sources || []

          // Add Assistant Message
          addMessage({
            role: 'assistant',
            content: aiContent,
            sources: sources
          })
          set({ loading: false })
        } catch (error) {
          let message = 'Failed to get response'
          if (error.response?.data?.detail) {
            const detail = error.response.data.detail
            if (Array.isArray(detail)) {
              message = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
            } else if (typeof detail === 'string') {
              message = detail
            } else if (typeof detail === 'object') {
              message = detail.detail || JSON.stringify(detail)
            }
          }
          set({ error: message, loading: false })
          toast.error(message)
        }
      },

      clearHistory: () => {
        set((state) => ({
          sessions: state.sessions.map(s =>
            s.id === state.activeSessionId ? { ...s, messages: [] } : s
          ),
        }))
      },

      clearAllSessions: () => {
        set({ sessions: [], activeSessionId: null })
      },
    }),
    {
      name: 'documind-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 50).map(s => ({
          ...s,
          messages: s.messages.slice(-100),
        })),
        activeSessionId: state.activeSessionId,
        selectedDocument: state.selectedDocument,
        selectedDocuments: state.selectedDocuments,
        selectedModel: state.selectedModel,
        historyOpen: state.historyOpen,
      }),
    }
  )
)

export default useChatStore
