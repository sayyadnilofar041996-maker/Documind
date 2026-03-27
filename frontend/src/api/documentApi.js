import client from './client'

const documentApi = {
  uploadDocument: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return client.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  fetchDocuments: () => {
    return client.get('/documents/')
  },

  deleteDocument: (id) => {
    return client.delete(`/documents/${id}`)
  }
}

export default documentApi
