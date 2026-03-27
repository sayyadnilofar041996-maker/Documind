import React from 'react'
import { Sparkles, FileText, Search, HelpCircle } from 'lucide-react'
import useChatStore from '../../store/chatStore'

const SuggestionCards = () => {
  const { setInputDraft } = useChatStore()

  const suggestions = [
    {
      title: 'Summarize documents',
      description: 'Get a quick overview of your uploaded files',
      icon: FileText,
      prompt: 'Can you summarize the main points of my uploaded documents?',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Extract key insights',
      description: 'Find important data points and trends',
      icon: Sparkles,
      prompt: 'What are the key insights and unique data points in these files?',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Explain concepts',
      description: 'Simplify complex terms or sections',
      icon: Search,
      prompt: 'Can you explain the most complex parts of these documents in simple terms?',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Quick Q&A',
      description: 'Ask specific questions about any file',
      icon: HelpCircle,
      prompt: 'I have a specific question about these documents: ',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          onClick={() => setInputDraft(item.prompt)}
          className="group flex flex-col items-start p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-2xl transition-all duration-300 text-left hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
        >
          <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
            <item.icon className="w-5 h-5" />
          </div>
          <h4 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        </button>
      ))}
    </div>
  )
}

export default SuggestionCards
