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
    <div className="w-full pb-24 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {loading && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start space-x-4 mb-8"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-800/50">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="glass-card border border-primary/20 px-6 py-4 rounded-3xl rounded-tl-none backdrop-blur-xl flex items-center space-x-3 shadow-premium ai-pulse">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0.3, 1, 0.3],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-primary/80 ml-1 tracking-[0.2em] uppercase font-display">
              Processing Intelligence
            </span>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow
