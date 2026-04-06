import client from './client'

const chatApi = {
  askQuestion: (question, documentId = null, model = "llama-3.1-8b-instant") => {
    return client.post('/query/ask', { 
      question,
      document_id: documentId,
      model
    })
  }
}

export default chatApi
