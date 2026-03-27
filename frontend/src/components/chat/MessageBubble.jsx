import React from 'react'
import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: 0.5 
      }}
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
          isUser ? 'ml-4 bg-primary text-white border-primary/20 ring-4 ring-primary/10' : 'mr-4 bg-card border-white/10 text-primary ring-4 ring-white/5'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-3xl shadow-2xl border transition-all duration-300 ${
            isUser 
              ? 'bg-gradient-to-br from-primary to-primary-hover text-white border-primary/20 rounded-tr-none shadow-primary/20' 
              : 'bg-white/5 text-gray-100 border-white/10 rounded-tl-none backdrop-blur-md shadow-black/20 hover:bg-white/10'
          }`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
              {message.content}
            </p>
          </div>
          <span className="text-[10px] text-gray-500 mt-2 px-2 font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isUser ? 'Sent' : 'Assistant'} • {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
