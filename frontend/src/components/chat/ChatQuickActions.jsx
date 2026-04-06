import React from 'react'
import { FileText, HelpCircle, List, Table, Globe, BarChart } from 'lucide-react'
import useChatStore from '../../store/chatStore'

const ChatQuickActions = () => {
  const { setInputDraft } = useChatStore()

  const actions = [
    { label: 'Summary', icon: FileText, prompt: 'Summarize my documents' },
    { label: 'Question', icon: HelpCircle, prompt: 'Answer questions from my documents' },
    { label: 'Outline', icon: List, prompt: 'Create an outline of the documents' },
    { label: 'Table', icon: Table, prompt: 'Extract key data into a table format' },
    { label: 'Language', icon: Globe, prompt: 'Translate the main points into [Language]' },
    { label: 'Analysis', icon: BarChart, prompt: 'Analyze the key insights' }
  ]

  return (
    <div className="flex flex-row md:grid md:grid-cols-6 gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => setInputDraft(action.prompt)}
          className="flex-shrink-0 group flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md min-w-[90px] md:min-w-0"
        >
          <div className="mb-1.5 p-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 rounded-lg group-hover:scale-110 transition-all duration-300">
            <action.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default ChatQuickActions
