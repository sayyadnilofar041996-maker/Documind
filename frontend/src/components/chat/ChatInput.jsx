import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import useChatStore from '../../store/chatStore'

const ChatInput = () => {
  const { sendMessage, loading, inputDraft, setInputDraft } = useChatStore()
  const textareaRef = useRef(null)

  const handleSend = async () => {
    if (!inputDraft.trim() || loading) return
    const message = inputDraft
    setInputDraft('')
    await sendMessage(message)
    
    // Focus back after send
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea and focus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputDraft])

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="p-4 bg-card/60 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl bg-opacity-80 transition-all focus-within:border-primary/30">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows="1"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask DocuMind anything..."
            className="w-full bg-transparent border-none rounded-xl py-3 px-2 text-white placeholder-gray-500 focus:outline-none transition-all resize-none max-h-48 text-base scrollbar-none disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputDraft.trim() || loading}
          className="mb-1 p-3 bg-primary hover:bg-primary/90 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
          title="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="flex justify-center items-center mt-3 border-t border-white/5 pt-3">
        <p className="text-[10px] text-gray-500 font-medium">
          Press <span className="text-gray-400">Enter</span> to send, <span className="text-gray-400">Shift + Enter</span> for new line
        </p>
      </div>
    </div>
  )
}

export default ChatInput
