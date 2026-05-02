import React from 'react'
import { Sparkles, FileText, Search, HelpCircle } from 'lucide-react'
import useChatStore from '../../store/chatStore'

const SuggestionCards = () => {
  const { setInputDraft } = useChatStore()

  const suggestions = [
    {
      title: 'Structural Synthesis',
      description: 'Generate a comprehensive executive summary of the document landscape.',
      icon: FileText,
      prompt: 'Synthesize a high-level executive summary of the document landscape.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10'
    },
    {
      title: 'Semantic Insights',
      description: 'Extract latent patterns and key data points from the repository.',
      icon: Sparkles,
      prompt: 'Extract deep semantic insights and latent patterns from the current corpus.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
      title: 'Technical Query',
      description: 'Perform a targeted technical search for specific data points.',
      icon: Search,
      prompt: 'Perform a targeted technical search for specific data points across the indices.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      title: 'Logic Extraction',
      description: 'Transform raw data into structured tabular representations.',
      icon: HelpCircle,
      prompt: 'Transform the extracted documentation into an optimized JSON/CSV tabular matrix.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4">
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          onClick={() => setInputDraft(item.prompt)}
          className="group flex flex-col items-start p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-300 text-left hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:shadow-lg active:scale-[0.98]"
        >
          <div className={`p-2.5 rounded-lg ${item.bg} ${item.color} mb-3 group-hover:scale-105 transition-transform`}>
            <item.icon className="w-5 h-5" />
          </div>
          <h4 className="text-zinc-900 dark:text-zinc-100 font-bold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.title}</h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
        </button>
      ))}
    </div>
  )
}

export default SuggestionCards
