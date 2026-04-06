import React from 'react'
import { Upload, MessageSquare, Files, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: 'Upload Document',
      description: 'Add new PDF or DOCX',
      icon: Upload,
      color: 'bg-blue-500',
      onClick: () => navigate('/documents')
    },
    {
      title: 'New Chat',
      description: 'Start AI conversation',
      icon: PlusCircle,
      color: 'bg-purple-500',
      onClick: () => navigate('/chat')
    },
    {
      title: 'Browse Library',
      description: 'View all documents',
      icon: Files,
      color: 'bg-emerald-500',
      onClick: () => navigate('/documents')
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-slate-900/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl transition-all duration-300 group text-left shadow-sm hover:shadow-xl hover:shadow-primary/5 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className={`p-3 rounded-xl ${action.color} bg-opacity-10 dark:bg-opacity-20 group-hover:bg-opacity-20 dark:group-hover:bg-opacity-30 group-hover:scale-110 transition-all duration-300 relative z-10 shadow-inner`}>
            <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')} opacity-90 group-hover:opacity-100`} />
          </div>
          <div className="relative z-10">
            <h4 className="text-slate-900 dark:text-white font-bold text-sm tracking-wide">{action.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
