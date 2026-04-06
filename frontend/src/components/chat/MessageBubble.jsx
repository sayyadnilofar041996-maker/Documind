import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bot, Download, FileText, File, TableProperties, FileType2, Volume2, VolumeX, Square, Info } from 'lucide-react'
import { exportToPdf, exportToDocx, exportToTxt, exportToCsv } from '../../utils/exportUtils'
import useChatStore from '../../store/chatStore'

const CitationBadge = ({ number, sources, onClick }) => {
  const source = sources?.[number - 1]
  if (!source) return <span className="text-primary font-bold">[{number}]</span>

  return (
    <span className="inline-flex items-center group/cite relative px-1">
      <button 
        onClick={() => onClick(source)}
        className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors border border-primary/20 hover:scale-110 active:scale-95"
      >
        [{number}]
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-2xl opacity-0 translate-y-2 group-hover/cite:opacity-100 group-hover/cite:translate-y-0 transition-all z-50 pointer-events-none border border-white/10">
        <div className="flex items-center space-x-1 mb-1 text-primary">
          <Info className="w-3 h-3" />
          <span className="font-bold uppercase tracking-wider text-white/90">Click to view source</span>
        </div>
        <div className="font-medium truncate">{source.document_name}</div>
        <div className="text-slate-400 mt-0.5">Page {source.page_number} • {Math.round(source.score * 100)}% match</div>
        <div className="mt-1.5 text-[9px] line-clamp-2 italic text-slate-300">"{source.text}"</div>
      </div>
    </span>
  )
}

const SpeechControl = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synth = window.speechSynthesis
  const utteranceRef = useRef(null)

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        synth.cancel()
      }
    }
  }, [])

  const handleSpeak = () => {
    if (isSpeaking) {
      synth.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    setIsSpeaking(true)
    synth.speak(utterance)
  }

  return (
    <button 
      onClick={handleSpeak}
      className={`flex items-center space-x-1.5 transition-colors px-2.5 py-1.5 rounded-lg border ${
        isSpeaking 
          ? 'bg-primary text-white border-primary shadow-lg ring-2 ring-primary/20' 
          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
      }`}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isSpeaking ? <Square className="w-3 h-3 fill-white" /> : <Volume2 className="w-3 h-3" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">{isSpeaking ? 'Stop' : 'Listen'}</span>
    </button>
  )
}

const ExportMenu = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 hover:text-primary text-slate-500 dark:text-slate-400 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800"
        title="Export options"
      >
        <Download className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Export</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 z-50 overflow-hidden backdrop-blur-xl"
            >
              <button onClick={() => { exportToPdf(content); setIsOpen(false) }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Download PDF</span>
              </button>
              <button onClick={() => { exportToDocx(content); setIsOpen(false) }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                <File className="w-4 h-4 text-blue-400" />
                <span>Save as Word</span>
              </button>
              <button onClick={() => { exportToTxt(content); setIsOpen(false) }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                <FileType2 className="w-4 h-4 text-slate-400" />
                <span>Export Text (.txt)</span>
              </button>
              {content.includes('|') && (
                <button onClick={() => { exportToCsv(content); setIsOpen(false) }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 pt-2">
                  <TableProperties className="w-4 h-4 text-emerald-400" />
                  <span>Extract Table (CSV)</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const { setActiveCitation } = useChatStore()
  
  // Custom citation parser
  const renderContent = (content) => {
    if (isUser) return content
    
    const parts = content.split(/(\[Source(?::)?\s*(\d+)(?:[^\]]*)?\])/gi)
    return parts.map((part, index) => {
      // Check if this part is a citation marker
      const match = part.match(/\[Source(?::)?\s*(\d+)/i)
      if (match) {
        return <CitationBadge key={index} number={parseInt(match[1])} sources={message.sources} onClick={setActiveCitation} />
      }
      return part
    })
  }

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
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-300 ${
            isUser ? 'ml-4 bg-primary text-white border-primary/20 ring-4 ring-primary/10' : 'mr-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-primary ring-4 ring-slate-100 dark:ring-slate-800/50'
          }`}
        >
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </motion.div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <motion.div 
            layout
            className={`px-6 py-4 rounded-3xl shadow-premium border transition-all duration-500 overflow-hidden relative ${
              isUser 
                ? 'bg-gradient-to-br from-primary to-primary-hover text-white border-primary/20 rounded-tr-none' 
                : 'glass-card text-slate-900 dark:text-slate-100 rounded-tl-none ai-pulse'
            }`}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight relative z-10">
              {renderContent(message.content)}
            </p>
          </motion.div>
          
          <div className="flex items-center space-x-3 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase font-display">
              {isUser ? 'Sent' : 'Assistant'} • {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {!isUser && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <SpeechControl text={message.content} />
                <ExportMenu content={message.content} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}


export default MessageBubble
