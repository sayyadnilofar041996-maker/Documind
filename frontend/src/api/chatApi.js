import client from './client'

const chatApi = {
  askQuestion: (question, documentId = null, model = "llama-3.1-8b-instant", documentIds = null) => {
    return client.post('/query/ask', { 
      question,
      document_id: documentId,
      document_ids: documentIds,
      model
    })
  }
}

export default chatApi
