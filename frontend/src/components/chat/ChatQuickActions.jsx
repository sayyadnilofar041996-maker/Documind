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
    { label: 'Language', icon: Globe, prompt: 'Translate the main points' },
    { label: 'Analysis', icon: BarChart, prompt: 'Analyze the key insights' }
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => setInputDraft(action.prompt)}
          className="group flex flex-col items-center justify-center p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-primary/30 hover:bg-primary/10 hover:scale-105 transition-all duration-300 shadow-sm"
        >
          <div className="mb-3 p-3 bg-white/5 group-hover:bg-primary/20 rounded-full group-hover:scale-110 transition-all duration-300">
            <action.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default ChatQuickActions
