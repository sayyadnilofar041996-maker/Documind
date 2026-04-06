import React, { useEffect } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import ChatQuickActions from '../components/chat/ChatQuickActions'
import ChatHistory from '../components/chat/ChatHistory'
import DocumentViewer from '../components/chat/DocumentViewer'
import { AnimatePresence } from 'framer-motion'
import useChatStore from '../store/chatStore'
import useDocumentStore from '../store/documentStore'

const ChatPage = () => {
  const { getMessages, loading, clearHistory, selectedDocument, setSelectedDocument, activeSessionId, activeCitation } = useChatStore()
  const { documents, fetchDocuments } = useDocumentStore()

  const messages = getMessages()

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
    <div className="w-full h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      
      {/* Chat History Sidebar */}
      <ChatHistory />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Messages Area (Scrollable) */}
        <div className={`flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 scroll-smooth animate-mesh ${messages.length === 0 ? 'py-2' : 'py-4'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-start pt-4 animate-in fade-in zoom-in-95 duration-1000">
              <div className="text-center mb-2 space-y-1">
                <h2 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase opacity-90">
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
        <div className="px-6 md:px-12 lg:px-24 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="max-w-4xl mx-auto w-full">
            <ChatInput />
            <p className="text-[10px] text-gray-500 text-center mt-2 font-medium tracking-tight">
              AI can make mistakes. Verify important information before use.
            </p>
          </div>
        </div>
      </div>

      {/* Document Source Viewer Panel */}
      <AnimatePresence>
        {activeCitation && <DocumentViewer key={activeCitation.chunk_id || activeCitation.id} />}
      </AnimatePresence>
    </div>
  )
}

export default ChatPage
