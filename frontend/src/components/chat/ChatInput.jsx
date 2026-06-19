import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Mic, MicOff, Paperclip } from 'lucide-react'
import useChatStore from '../../store/chatStore'
import toast from 'react-hot-toast'

const ChatInput = ({ children }) => {
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
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
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
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    setInputDraft('')
    await sendMessage(message)
    
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputDraft])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="relative group/input w-full">
      <div className="relative flex flex-col bg-zinc-50/50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 focus-within:border-zinc-300 dark:focus-within:border-zinc-600 focus-within:bg-white dark:focus-within:bg-zinc-900 shadow-sm focus-within:shadow-md min-h-[140px]">
        
        {/* Text Input */}
        <div className="flex-1 p-5 pb-2">
          <textarea
            ref={textareaRef}
            rows="1"
            value={inputDraft}
            onChange={(e) => setInputDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={isListening ? "Listening..." : "Ask Anything..."}
            className="w-full h-full bg-transparent border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none max-h-48 text-base overflow-auto scrollbar-none disabled:opacity-50"
          />
        </div>

        {/* Bottom Bar: Action buttons and Tool Chips */}
        <div className="p-3 pb-4 px-4 flex items-center justify-between">
          
          <div className="flex items-center space-x-2 md:space-x-4 flex-wrap gap-y-2">
            <button
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            {children}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Voice Input */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center relative ${
                isListening 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={isListening ? "Stop Listening" : "Voice Input"}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 z-10" />
                  <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-20"></span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputDraft.trim() || loading}
              className={`w-9 h-9 rounded-lg transition-all duration-300 transform flex items-center justify-center ${
                !inputDraft.trim() || loading
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-700'
                  : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-95'
              }`}
              title="Send Query"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChatInput
