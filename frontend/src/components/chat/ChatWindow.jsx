import React, { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { Bot, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null)

  const prevMessageCount = useRef(messages.length)

  useEffect(() => {
    // Scroll down if user just sent a message (loading becomes true) 
    // or if a new user message is added
    const isNewUserMessage = messages.length > prevMessageCount.current && messages[messages.length - 1]?.role === 'user'
    
    if (loading || isNewUserMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    
    prevMessageCount.current = messages.length
  }, [messages, loading])

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full pb-32 space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-4 mb-10"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="glass-card px-6 py-4 rounded-2xl rounded-tl-none flex items-center space-x-3 shadow-md border border-zinc-200 dark:border-zinc-800 transition-colors">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest italic">
              Synthesizing intelligence...
            </span>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow
