import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, MicOff } from 'lucide-react'
import useChatStore from '../../store/chatStore'
import toast from 'react-hot-toast'

const ChatInput = () => {
  const { sendMessage, loading, inputDraft, setInputDraft } = useChatStore()
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          setInputDraft(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied')
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [setInputDraft])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Listening...')
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }

  const handleSend = async () => {
    if (!inputDraft.trim() || loading) return
    const message = inputDraft
    
    // Stop listening on send if active
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

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
    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl bg-opacity-80 transition-all focus-within:border-primary/30">
      <div className="flex items-end space-x-2 sm:space-x-3">
        <button
          onClick={toggleListening}
          className={`mb-1 p-2.5 rounded-xl transition-all transform active:scale-95 flex items-center justify-center relative ${
            isListening 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title={isListening ? "Stop listening" : "Talk to DocuMind"}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 z-10" />
              <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-25"></span>
            </>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows="1"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={isListening ? "I'm listening..." : "Ask DocuMind anything..."}
            className="w-full bg-transparent border-none rounded-xl py-2 px-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all resize-none max-h-32 text-base scrollbar-none disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputDraft.trim() || loading}
          className="mb-1 p-2.5 bg-primary hover:bg-primary-hover disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
          title="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="flex justify-center items-center mt-2 border-t border-slate-50 dark:border-slate-800/50 pt-2">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
          {isListening ? 'Speech Recognition Active' : 'Enter ⏎ to send · Shift + Enter ⏎ for new line'}
        </p>
      </div>
    </div>
  )
}


export default ChatInput
