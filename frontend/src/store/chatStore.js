import { create } from 'zustand'
import chatApi from '../api/chatApi'
import toast from 'react-hot-toast'

const useChatStore = create((set, get) => ({
  messages: [],
  loading: false,
  selectedDocument: null,
  inputDraft: '',
  error: null,

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
  setInputDraft: (content) => set({ inputDraft: content }),

  addMessage: (message) => {
    set((state) => ({ 
      messages: [...state.messages, { ...message, id: Date.now() }] 
    }))
  },

  sendMessage: async (content) => {
    if (!content.trim()) return

    const { addMessage, selectedDocument } = get()
    
    // Add User Message
    addMessage({ role: 'user', content })
    
    set({ loading: true, error: null })
    
    try {
      const response = await chatApi.askQuestion(content, selectedDocument?.id)
      const aiContent = response.data.answer || response.data.response
      
      // Add Assistant Message
      addMessage({ role: 'assistant', content: aiContent })
      set({ loading: false })
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to get response'
      set({ error: message, loading: false })
      toast.error(message)
    }
  },

  clearHistory: () => {
    set({ messages: [] })
  }
}))

export default useChatStore
