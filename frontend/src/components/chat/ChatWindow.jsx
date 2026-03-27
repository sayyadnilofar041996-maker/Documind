import React, { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { Bot, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
          className="flex items-start space-x-4 ml-2 mb-8"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ring-4 ring-white/5">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl rounded-tl-none backdrop-blur-md flex items-center space-x-2">
            <div className="flex space-x-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-400 ml-2 tracking-wide uppercase">Assistant is thinking...</span>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow
