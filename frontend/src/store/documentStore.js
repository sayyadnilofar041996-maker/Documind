import { create } from 'zustand'
import documentApi from '../api/documentApi'
import toast from 'react-hot-toast'

const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  uploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null })
    try {
      const response = await documentApi.fetchDocuments()
      set({ documents: response.data.items || [], loading: false })
    } catch (error) {
      let message = 'Failed to fetch documents'
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
    } finally {
      set({ loading: false })
    }
  },

  uploadDocument: async (file) => {
    set({ uploading: true, error: null })
    try {
      await documentApi.uploadDocument(file)
      toast.success('Document uploaded successfully!')
      // Refresh list to sync with server
      await get().fetchDocuments()
      set({ error: null })
      return true
    } catch (error) {
      let message = 'Document upload failed. Please try again.'
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
      set({ error: message })
      toast.error(message)
      return false
    } finally {
      set({ uploading: false })
    }
  },

  deleteDocument: async (id) => {
    try {
      await documentApi.deleteDocument(id)
      set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      }))
      toast.success('Document deleted')
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }
}))

export default useDocumentStore
