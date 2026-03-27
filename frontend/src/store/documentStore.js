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
      const message = error.response?.data?.detail || 'Failed to fetch documents'
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
      const message = error.response?.data?.detail || 'Upload failed'
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
