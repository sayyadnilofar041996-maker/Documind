import { FileText, HelpCircle, List, Table, Globe, BarChart } from 'lucide-react'
import { motion } from 'framer-motion'
import useChatStore from '../../store/chatStore'

const ChatQuickActions = () => {
  const { setInputDraft } = useChatStore()

  const actions = [
    { label: 'Summarize', icon: FileText, prompt: 'Synthesize a high-level executive summary of the document landscape.' },
    { label: 'Query', icon: HelpCircle, prompt: 'Perform a targeted search for specific data points across indices.' },
    { label: 'Outline', icon: List, prompt: 'Generate a structured structural hierarchy of the extracted intelligence.' },
    { label: 'Tablify', icon: Table, prompt: 'Transform raw data into an optimized JSON/CSV tabular matrix.' },
    { label: 'Language', icon: Globe, prompt: 'Relay the core intelligence into a specified linguistic format.' },
    { label: 'Insight', icon: BarChart, prompt: 'Extract deep semantic insights and latent patterns from the corpus.' }
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => setInputDraft(action.prompt)}
          className="group flex items-center space-x-2 px-3 py-1.5 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg transition-all duration-300 active:scale-95"
        >
          <action.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}


export default ChatQuickActions
