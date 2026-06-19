import React, { useEffect } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import ChatQuickActions from '../components/chat/ChatQuickActions'
import ChatHistory from '../components/chat/ChatHistory'
import DocumentViewer from '../components/chat/DocumentViewer'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Command } from 'lucide-react'
import useChatStore from '../store/chatStore'
import useDocumentStore from '../store/documentStore'

const ChatPage = () => {
  const { getMessages, loading, selectedDocument, activeCitation } = useChatStore()
  const { fetchDocuments } = useDocumentStore()

  const messages = getMessages()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="w-full h-[calc(100vh-80px)] flex overflow-hidden bg-white dark:bg-zinc-950 relative">
      
      {/* Chat History Sidebar */}
      <ChatHistory />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative items-center">
        {messages.length === 0 ? (
          // EMPTY STATE (Grok-like Landing)
          <div className="flex-1 w-full flex flex-col overflow-y-auto scrollbar-none items-center justify-start pt-[10vh] md:pt-[15vh] px-6 lg:px-12">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl flex flex-col items-center"
            >
              {/* Header */}
              <div className="flex items-center space-x-3 mb-6 relative">
                <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full" />
                <Command className="w-8 h-8 text-indigo-500 relative z-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight font-display text-center">
                Welcome to DocuMind Engine
              </h1>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 text-center max-w-xl mb-12 leading-relaxed font-medium">
                Introducing DocuMind Engine — an advanced AI built to challenge assumptions, extract deep intelligence from your workflow, and help you think beyond the obvious. Fast. Bold. Unfiltered.
              </p>

              {/* Main Input area spanning wide */}
              <div className="w-full relative z-10 mb-20 shadow-2xl shadow-indigo-500/5 rounded-2xl">
                <ChatInput>
                  {/* Embedded Quick Actions only when empty */}
                  <ChatQuickActions />
                </ChatInput>
              </div>
            </motion.div>
          </div>
        ) : (
          // ACTIVE STATE
          <>
            <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 py-8 scroll-smooth w-full">
              <div className="max-w-4xl mx-auto w-full h-full">
                <ChatWindow messages={messages} loading={loading} />
              </div>
            </div>

            {/* Bottom Pinned Input Area */}
            <div className="w-full px-6 md:px-12 lg:px-24 pb-8 pt-4 bg-gradient-to-t from-white via-white/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent z-10 bottom-0 relative shrink-0">
              <div className="max-w-4xl mx-auto w-full group relative shadow-2xl shadow-indigo-500/5 rounded-2xl">
                <ChatInput />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document Source Viewer Panel */}
      <AnimatePresence>
        {activeCitation && <DocumentViewer key={activeCitation.chunk_id || activeCitation.id} />}
      </AnimatePresence>
    </div>
  )
}

export default ChatPage

