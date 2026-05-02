import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bot, Download, FileText, File, TableProperties, FileType2, Volume2, VolumeX, Square, Info } from 'lucide-react'
import { exportToPdf, exportToDocx, exportToTxt, exportToCsv } from '../../utils/exportUtils'
import useChatStore from '../../store/chatStore'

const CitationBadge = ({ number, sources, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  const source = sources?.[number - 1]
  if (!source) return <span className="text-[#7c5cfc] font-bold">[{number}]</span>

  return (
    <span 
      className="inline-flex items-center relative px-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => onClick(source)}
        className="cursor-pointer bg-[#7c5cfc]/10 hover:bg-[#7c5cfc]/20 text-[#7c5cfc] text-[10px] font-bold px-2 py-0.5 rounded-[4px] border border-[#7c5cfc]/20 transition-all active:scale-95 shadow-sm"
      >
        {number}
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[280px] p-4 bg-[#0f1117]/95 backdrop-blur-xl rounded-[15px] shadow-2xl z-50 pointer-events-none border border-[rgba(255,255,255,0.07)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-[#7c5cfc]/10 flex items-center justify-center border border-[#7c5cfc]/20">
                  <FileText className="w-3.5 h-3.5 text-[#7c5cfc]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#7c5cfc] uppercase tracking-[0.2em] leading-none">Evidence</span>
                  <span className="text-[11px] font-bold text-white truncate max-w-[140px] mt-0.5">{source.document_name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Authenticity</span>
                <span className="text-[9px] font-bold text-[#4fa3f7] bg-[#4fa3f7]/10 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider border border-[#4fa3f7]/20">
                  {Math.round(source.score * 100)}% Match
                </span>
              </div>
            </div>
            
            <div className="relative group/text">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-[#7c5cfc] rounded-full opacity-50" />
              <div className="text-[11px] leading-relaxed italic text-white/70 font-medium pl-1 line-clamp-4">
                "{source.text}"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                <Info size={12} className="text-[#7c5cfc]" />
                <span>Page {source.page_number || 1}</span>
              </div>
              <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                ZeroPoint Intelligence
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className={`flex items-center space-x-2 transition-all px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider text-[10px] shadow-sm ${
        isSpeaking 
          ? 'bg-indigo-600 text-white border-indigo-700' 
          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3 h-3 fill-white" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span>Narrate</span>
        </>
      )}
    </button>
  )
}

const ExportMenu = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 transition-all bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px] shadow-sm"
      >
        <Download size={14} />
        <span>Export</span>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute left-0 bottom-full mb-3 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 z-50 overflow-hidden"
            >
              {[
                  { fn: () => exportToPdf(content), icon: FileText, label: 'Export PDF', color: 'text-rose-500' },
                  { fn: () => exportToDocx(content), icon: File, label: 'Export DOCX', color: 'text-indigo-500' },
                  { fn: () => exportToTxt(content), icon: FileType2, label: 'Export TEXT', color: 'text-zinc-500' },
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => { item.fn(); setIsOpen(false) }} 
                  className="w-full flex items-center space-x-3 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-all"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
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
  
  const renderContent = (content) => {
    if (isUser) return content
    
    const parts = content.split(/(\[Source(?::)?\s*(\d+)(?:[^\]]*)?\])/gi)
    return parts.map((part, index) => {
      const match = part.match(/\[Source(?::)?\s*(\d+)/i)
      if (match) {
        return <CitationBadge key={index} number={parseInt(match[1])} sources={message.sources} onClick={setActiveCitation} />
      }
      return part
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}>
        {/* Avatar */}
        <div className={`relative flex-shrink-0 w-10 h-10 ${isUser ? 'ml-4' : 'mr-4'}`}>
          <div className={`relative w-full h-full rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 ${
            isUser ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-500/20' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-500'
          }`}>
            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
          <div className={`relative px-6 py-4 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
              : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-800'
          }`}>
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
              {renderContent(message.content)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-3 px-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold tracking-wider uppercase ${isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {isUser ? 'User' : 'Assistant'}
              </span>
              <span className="text-zinc-200 dark:text-zinc-800">•</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase">
                {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {!isUser && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
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
