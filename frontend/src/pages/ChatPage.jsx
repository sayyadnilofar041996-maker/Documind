import React, { useEffect } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import ChatQuickActions from '../components/chat/ChatQuickActions'
import useChatStore from '../store/chatStore'
import useDocumentStore from '../store/documentStore'
import { MessageSquare, Eraser, FileText, ChevronDown } from 'lucide-react'

const ChatPage = () => {
  const { messages, loading, clearHistory, selectedDocument, setSelectedDocument } = useChatStore()
  const { documents, fetchDocuments } = useDocumentStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDocumentChange = (e) => {
    const docId = e.target.value
    const doc = documents.find(d => d.id === docId) || null
    
    if (messages.length > 0) {
      if (window.confirm("Start new chat for this document?")) {
        clearHistory()
        setSelectedDocument(doc)
      }
    } else {
      setSelectedDocument(doc)
    }
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-background">
      {/* Header Area */}
      <div className="px-6 md:px-16 lg:px-32 py-4 shrink-0 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700 bg-background z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-lg shadow-primary/20">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Assistant</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System Ready</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Document Selector */}
          <div className="relative group flex items-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-3 hidden sm:block">Context</span>
            <div className="relative">
              <select
                value={selectedDocument?.id || ''}
                onChange={handleDocumentChange}
                className="appearance-none bg-transparent hover:bg-white/5 text-white pl-10 pr-12 py-2.5 rounded-2xl transition-all text-sm border border-white/10 focus:outline-none focus:border-primary/50 cursor-pointer min-w-[240px]"
              >
                <option value="" className="bg-card text-white">All Documents ({documents.length})</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-card text-white">
                    {doc.original_filename || doc.filename}
                  </option>
                ))}
              </select>
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-80" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>

          <button 
            onClick={clearHistory}
            className="flex items-center space-x-2 px-5 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-2xl transition-all text-sm border border-transparent hover:border-white/10 group"
            title="Clear conversation"
          >
            <Eraser className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 md:px-16 lg:px-32 py-6 scrollbar-none scroll-smooth bg-background">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                Ask anything about your documents
              </h2>
            </div>
            <div className="w-full max-w-4xl mx-auto">
              <ChatQuickActions />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            <ChatWindow messages={messages} loading={loading} />
          </div>
        )}
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="px-6 md:px-16 lg:px-32 py-6 border-t border-white/5 bg-background shrink-0 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput />
          <p className="text-[10px] text-gray-500 text-center mt-3 font-medium tracking-tight">
            AI can make mistakes. Verify important information before use.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
