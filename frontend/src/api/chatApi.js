import client from './client'

const chatApi = {
  askQuestion: (question, documentId = null) => {
    return client.post('/query/ask', { 
      question,
      document_id: documentId 
    })
  }
}

export default chatApi
